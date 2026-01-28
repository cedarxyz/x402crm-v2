/**
 * x402 CRM v2 - CRM API Routes
 *
 * Implements the API that sbtc-appleseed expects:
 * - GET /crm - List all providers (returns { entries: [...] })
 * - PUT /crm/:provider_id - Update a provider
 * - POST /crm - Create a new provider
 *
 * Plus additional endpoints for the UI:
 * - GET /crm/:provider_id - Get single provider
 * - GET /crm/:provider_id/history - Get verification history
 * - GET /stats - Aggregate statistics
 * - GET /leads - UI-friendly lead list
 */

import { Hono } from 'hono';
import type {
  Env,
  ProviderRow,
  CrmEntry,
  CrmListResponse,
  CrmUpdateRequest,
  CrmCreateRequest,
  Lead,
  CrmStats,
  VerificationHistoryEntry,
} from '../types';

export const crmRoutes = new Hono<{ Bindings: Env }>();

/**
 * Convert DB row to sbtc-appleseed compatible format
 */
function rowToCrmEntry(row: ProviderRow): CrmEntry {
  return {
    provider_id: row.provider_id,
    synced_data: {
      domain: row.domain || undefined,
      name: row.name || undefined,
      company: row.company || undefined,
      email: row.email || undefined,
      twitter: row.twitter || undefined,
      endpoint_url: row.endpoint_url || undefined,
      chain: row.chain || undefined,
      estimated_mrr: row.estimated_mrr || undefined,
    },
    notes: row.notes || undefined,
    supports_sbtc: row.supports_sbtc,
    pipeline_status: row.pipeline_status,
    verification_status: row.verification_status || undefined,
    verification_tx_id: row.verification_tx_id || undefined,
    verification_timestamp: row.verification_timestamp || undefined,
    sbtc_sent_total: row.sbtc_sent_total || undefined,
    issue_url: row.issue_url || undefined,
  };
}

/**
 * Convert DB row to UI-friendly lead format
 */
function rowToLead(row: ProviderRow): Lead {
  return {
    id: row.id,
    provider_id: row.provider_id,
    name: row.name || 'Unknown',
    company: row.company || 'Unknown',
    email: row.email || '',
    twitter: row.twitter || '',
    chain: row.chain || 'Unknown',
    endpoint: row.endpoint_url || row.domain || '',
    status: row.pipeline_status,
    lastContact: row.updated_at,
    notes: row.notes || '',
    mrr: row.estimated_mrr || 0,
    supports_sbtc: row.supports_sbtc,
    verification_status: row.verification_status,
    verification_tx_id: row.verification_tx_id,
  };
}

/**
 * GET / - List all providers (sbtc-appleseed format)
 * Returns { entries: CrmEntry[] }
 */
crmRoutes.get('/', async (c) => {
  const db = c.env.DB;

  const { results } = await db
    .prepare('SELECT * FROM providers ORDER BY updated_at DESC')
    .all<ProviderRow>();

  const entries = results.map(rowToCrmEntry);

  return c.json<CrmListResponse>({
    entries,
    total: entries.length,
  });
});

/**
 * GET /leads - List all providers (UI format)
 * Returns Lead[]
 */
crmRoutes.get('/leads', async (c) => {
  const db = c.env.DB;

  const { results } = await db
    .prepare('SELECT * FROM providers ORDER BY updated_at DESC')
    .all<ProviderRow>();

  const leads = results.map(rowToLead);

  return c.json(leads);
});

/**
 * GET /stats - Aggregate statistics
 */
crmRoutes.get('/stats', async (c) => {
  const db = c.env.DB;

  // Total providers
  const totalResult = await db
    .prepare('SELECT COUNT(*) as count FROM providers')
    .first<{ count: number }>();

  // Count by status
  const statusResults = await db
    .prepare('SELECT pipeline_status, COUNT(*) as count FROM providers GROUP BY pipeline_status')
    .all<{ pipeline_status: string; count: number }>();

  // Count by chain
  const chainResults = await db
    .prepare('SELECT chain, COUNT(*) as count FROM providers GROUP BY chain')
    .all<{ chain: string; count: number }>();

  // sBTC supporters
  const sbtcResult = await db
    .prepare('SELECT COUNT(*) as count FROM providers WHERE supports_sbtc = 1')
    .first<{ count: number }>();

  // Verified count
  const verifiedResult = await db
    .prepare("SELECT COUNT(*) as count FROM providers WHERE verification_status = 'passed'")
    .first<{ count: number }>();

  // Total sBTC sent
  const sbtcSentResult = await db
    .prepare('SELECT COALESCE(SUM(sbtc_sent_total), 0) as total FROM providers')
    .first<{ total: number }>();

  // This week stats
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const newThisWeek = await db
    .prepare('SELECT COUNT(*) as count FROM providers WHERE created_at >= ?')
    .bind(weekAgo)
    .first<{ count: number }>();

  const verificationsThisWeek = await db
    .prepare('SELECT COUNT(*) as count FROM verification_history WHERE timestamp >= ?')
    .bind(weekAgo)
    .first<{ count: number }>();

  const conversionsThisWeek = await db
    .prepare("SELECT COUNT(*) as count FROM providers WHERE pipeline_status = 'converted' AND updated_at >= ?")
    .bind(weekAgo)
    .first<{ count: number }>();

  const stats: CrmStats = {
    total_providers: totalResult?.count || 0,
    by_status: Object.fromEntries(
      statusResults.results.map((r) => [r.pipeline_status, r.count])
    ),
    by_chain: Object.fromEntries(
      chainResults.results.map((r) => [r.chain || 'unknown', r.count])
    ),
    supports_sbtc_count: sbtcResult?.count || 0,
    verified_count: verifiedResult?.count || 0,
    total_sbtc_sent: sbtcSentResult?.total || 0,
    this_week: {
      new_providers: newThisWeek?.count || 0,
      verifications: verificationsThisWeek?.count || 0,
      conversions: conversionsThisWeek?.count || 0,
    },
  };

  return c.json(stats);
});

/**
 * GET /:provider_id - Get single provider
 */
crmRoutes.get('/:provider_id', async (c) => {
  const db = c.env.DB;
  const providerId = c.req.param('provider_id');

  const row = await db
    .prepare('SELECT * FROM providers WHERE provider_id = ?')
    .bind(providerId)
    .first<ProviderRow>();

  if (!row) {
    return c.json({ error: 'Provider not found' }, 404);
  }

  return c.json(rowToCrmEntry(row));
});

/**
 * GET /:provider_id/history - Get verification history
 */
crmRoutes.get('/:provider_id/history', async (c) => {
  const db = c.env.DB;
  const providerId = c.req.param('provider_id');

  const { results } = await db
    .prepare(
      'SELECT * FROM verification_history WHERE provider_id = ? ORDER BY timestamp DESC LIMIT 50'
    )
    .bind(providerId)
    .all<{
      id: number;
      provider_id: string;
      timestamp: string;
      status: string;
      tx_id: string | null;
      amount_sats: number | null;
      error: string | null;
    }>();

  const history: VerificationHistoryEntry[] = results.map((r) => ({
    timestamp: r.timestamp,
    status: r.status as 'passed' | 'failed',
    tx_id: r.tx_id,
    amount_sats: r.amount_sats,
    error: r.error,
    note: r.status === 'passed'
      ? `Verified: ${r.amount_sats || 0} sats sent`
      : `Failed: ${r.error || 'unknown error'}`,
  }));

  return c.json({ provider_id: providerId, history });
});

/**
 * POST / - Create new provider
 */
crmRoutes.post('/', async (c) => {
  const db = c.env.DB;
  const body = await c.req.json<CrmCreateRequest>();

  // Generate provider_id if not provided
  const providerId = body.provider_id || generateProviderId(body.name, body.company);

  try {
    await db
      .prepare(
        `INSERT INTO providers (
          provider_id, name, company, email, twitter,
          domain, endpoint_url, chain, pipeline_status,
          notes, estimated_mrr
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        providerId,
        body.name || null,
        body.company || null,
        body.email || null,
        body.twitter || null,
        body.domain || extractDomain(body.endpoint_url),
        body.endpoint_url || null,
        body.chain || 'unknown',
        body.pipeline_status || 'new',
        body.notes || null,
        body.estimated_mrr || 0
      )
      .run();

    return c.json({ success: true, provider_id: providerId }, 201);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    if (message.includes('UNIQUE constraint')) {
      return c.json({ error: 'Provider ID already exists' }, 409);
    }
    throw err;
  }
});

/**
 * PUT /:provider_id - Update provider (sbtc-appleseed compatible)
 *
 * This is the main endpoint sbtc-appleseed calls to update verification results.
 * It appends to notes and updates verification fields.
 */
crmRoutes.put('/:provider_id', async (c) => {
  const db = c.env.DB;
  const providerId = c.req.param('provider_id');
  const body = await c.req.json<CrmUpdateRequest>();

  // Check if provider exists
  const existing = await db
    .prepare('SELECT * FROM providers WHERE provider_id = ?')
    .bind(providerId)
    .first<ProviderRow>();

  if (!existing) {
    return c.json({ error: 'Provider not found' }, 404);
  }

  // Build update query dynamically
  const updates: string[] = [];
  const values: (string | number | boolean | null)[] = [];

  // Handle notes - append if existing, otherwise set
  if (body.notes !== undefined) {
    if (existing.notes) {
      updates.push('notes = ?');
      values.push(`${existing.notes}\n${body.notes}`);
    } else {
      updates.push('notes = ?');
      values.push(body.notes);
    }
  }

  if (body.supports_sbtc !== undefined) {
    updates.push('supports_sbtc = ?');
    values.push(body.supports_sbtc ? 1 : 0);
  }

  if (body.pipeline_status !== undefined) {
    updates.push('pipeline_status = ?');
    values.push(body.pipeline_status);
  }

  if (body.verification_status !== undefined) {
    updates.push('verification_status = ?');
    values.push(body.verification_status);
    updates.push('verification_timestamp = ?');
    values.push(new Date().toISOString());
  }

  if (body.verification_tx_id !== undefined) {
    updates.push('verification_tx_id = ?');
    values.push(body.verification_tx_id);
  }

  if (body.sbtc_sent_total !== undefined) {
    // Add to existing total
    updates.push('sbtc_sent_total = sbtc_sent_total + ?');
    values.push(body.sbtc_sent_total);
  }

  if (body.issue_url !== undefined) {
    updates.push('issue_url = ?');
    values.push(body.issue_url);
  }

  if (body.endpoint_url !== undefined) {
    updates.push('endpoint_url = ?');
    values.push(body.endpoint_url);
    // Also update domain if not set
    if (!existing.domain) {
      updates.push('domain = ?');
      values.push(extractDomain(body.endpoint_url));
    }
  }

  if (updates.length === 0) {
    return c.json({ success: true, message: 'No updates provided' });
  }

  values.push(providerId);

  await db
    .prepare(`UPDATE providers SET ${updates.join(', ')} WHERE provider_id = ?`)
    .bind(...values)
    .run();

  // If this is a verification update, also log to history
  if (body.verification_status !== undefined) {
    await db
      .prepare(
        `INSERT INTO verification_history (
          provider_id, status, tx_id, amount_sats, error, endpoint_tested
        ) VALUES (?, ?, ?, ?, ?, ?)`
      )
      .bind(
        providerId,
        body.verification_status,
        body.verification_tx_id || null,
        body.sbtc_sent_total || null,
        body.verification_status === 'failed' ? (body.notes || null) : null,
        body.endpoint_url || existing.endpoint_url || null
      )
      .run();
  }

  return c.json({ success: true, provider_id: providerId });
});

/**
 * POST /:provider_id/verify - Probe endpoint and record verification result
 *
 * This is a "dry-run" verification - it probes the endpoint to check if it
 * returns 402 and parses the payment requirements. It does NOT send payment.
 * Use sbtc-appleseed for full payment verification.
 */
crmRoutes.post('/:provider_id/verify', async (c) => {
  const db = c.env.DB;
  const providerId = c.req.param('provider_id');

  // Get provider
  const provider = await db
    .prepare('SELECT * FROM providers WHERE provider_id = ?')
    .bind(providerId)
    .first<ProviderRow>();

  if (!provider) {
    return c.json({ error: 'Provider not found' }, 404);
  }

  const endpointUrl = provider.endpoint_url;
  if (!endpointUrl) {
    return c.json({ error: 'Provider has no endpoint URL configured' }, 400);
  }

  // Probe the endpoint
  const probeResult = await probeEndpoint(endpointUrl);

  // Record in verification_history
  await db
    .prepare(
      `INSERT INTO verification_history (
        provider_id, status, tx_id, amount_sats, error, endpoint_tested
      ) VALUES (?, ?, ?, ?, ?, ?)`
    )
    .bind(
      providerId,
      probeResult.success ? 'passed' : 'failed',
      null, // No tx for probe-only
      probeResult.amount ? parseInt(probeResult.amount, 10) : null,
      probeResult.error || null,
      endpointUrl
    )
    .run();

  // Update provider verification status
  const updates = [
    'verification_status = ?',
    'verification_timestamp = ?',
  ];
  const values: (string | number)[] = [
    probeResult.success ? 'passed' : 'failed',
    new Date().toISOString(),
  ];

  // If probe found sBTC/Stacks, mark as supports_sbtc
  if (probeResult.success && probeResult.hasStacks) {
    updates.push('supports_sbtc = 1');
  }

  // Append note
  const note = probeResult.success
    ? `Probe ${new Date().toLocaleDateString()}: PASSED - ${probeResult.version} endpoint, accepts ${probeResult.tokenType || 'STX'}`
    : `Probe ${new Date().toLocaleDateString()}: FAILED - ${probeResult.error}`;

  updates.push('notes = CASE WHEN notes IS NULL THEN ? ELSE notes || ? END');
  values.push(note, '\n' + note);

  values.push(providerId);

  await db
    .prepare(`UPDATE providers SET ${updates.join(', ')} WHERE provider_id = ?`)
    .bind(...values)
    .run();

  return c.json({
    success: probeResult.success,
    provider_id: providerId,
    endpoint: endpointUrl,
    probe: probeResult,
  });
});

/**
 * DELETE /:provider_id - Delete provider
 */
crmRoutes.delete('/:provider_id', async (c) => {
  const db = c.env.DB;
  const providerId = c.req.param('provider_id');

  const result = await db
    .prepare('DELETE FROM providers WHERE provider_id = ?')
    .bind(providerId)
    .run();

  if (result.meta.changes === 0) {
    return c.json({ error: 'Provider not found' }, 404);
  }

  // Also delete history
  await db
    .prepare('DELETE FROM verification_history WHERE provider_id = ?')
    .bind(providerId)
    .run();

  return c.json({ success: true, deleted: providerId });
});

// Helper functions

function generateProviderId(name?: string, company?: string): string {
  const base = [name, company].filter(Boolean).join('-').toLowerCase();
  const slug = base
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 30);
  const suffix = Date.now().toString(36).slice(-4);
  return slug ? `${slug}-${suffix}` : `provider-${suffix}`;
}

function extractDomain(url?: string): string | null {
  if (!url) return null;
  try {
    // Handle URLs without protocol
    const withProtocol = url.startsWith('http') ? url : `https://${url}`;
    return new URL(withProtocol).hostname;
  } catch {
    // If it's not a valid URL, try to extract domain-like string
    const match = url.match(/^([a-zA-Z0-9.-]+)/);
    return match?.[1] ?? null;
  }
}

// Probe result type
interface ProbeResult {
  success: boolean;
  version: 'v1' | 'v2' | null;
  httpStatus: number;
  error?: string;
  amount?: string;
  payTo?: string;
  tokenType?: string;
  hasStacks: boolean;
  raw?: unknown;
}

const STACKS_NETWORK_PREFIXES = ['stacks:1', 'stacks:2147483648'];
const SBTC_IDENTIFIERS = ['sbtc', 'token-sbtc', 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9'];

/**
 * Probe an x402 endpoint to check if it returns 402 and parse payment requirements.
 * This is a simplified version of the sbtc-appleseed probe.
 */
async function probeEndpoint(url: string): Promise<ProbeResult> {
  // Ensure URL has protocol
  const fullUrl = url.startsWith('http') ? url : `https://${url}`;

  let res: Response;
  try {
    res = await fetch(fullUrl, {
      method: 'GET',
      headers: { 'User-Agent': 'x402crm-v2/1.0' },
    });
  } catch (err) {
    return {
      success: false,
      version: null,
      httpStatus: 0,
      hasStacks: false,
      error: `Failed to reach endpoint: ${err instanceof Error ? err.message : String(err)}`,
    };
  }

  if (res.status !== 402) {
    return {
      success: false,
      version: null,
      httpStatus: res.status,
      hasStacks: false,
      error: `Expected HTTP 402, got ${res.status}`,
    };
  }

  let body: unknown;
  try {
    body = await res.json();
  } catch {
    return {
      success: false,
      version: null,
      httpStatus: 402,
      hasStacks: false,
      error: '402 response body is not valid JSON',
    };
  }

  // Detect v1 vs v2
  if (typeof body === 'object' && body !== null) {
    const obj = body as Record<string, unknown>;

    // v2: has x402Version or accepts array
    if (obj.x402Version === 2 || Array.isArray(obj.accepts)) {
      const accepts = (obj.accepts as Array<Record<string, unknown>>) || [];
      const stacksOption = accepts.find((a) =>
        STACKS_NETWORK_PREFIXES.some((p) => String(a.network || '').startsWith(p.split(':')[0] ?? ''))
      );
      const sbtcOption = accepts.find((a) =>
        SBTC_IDENTIFIERS.some((id) =>
          String(a.asset || '').toLowerCase().includes(id) ||
          String((a.extra as Record<string, unknown>)?.tokenType || '').toLowerCase().includes('sbtc')
        )
      );

      return {
        success: true,
        version: 'v2',
        httpStatus: 402,
        hasStacks: !!stacksOption,
        amount: String(stacksOption?.amount || sbtcOption?.amount || ''),
        payTo: String(stacksOption?.payTo || sbtcOption?.payTo || ''),
        tokenType: sbtcOption ? 'sBTC' : (stacksOption ? 'STX' : 'unknown'),
        raw: body,
      };
    }

    // v1: has maxAmountRequired, payTo, etc.
    if (obj.maxAmountRequired !== undefined || obj.payTo !== undefined) {
      // Check for nested payment object (some v1 variants)
      const payment = (obj.payment as Record<string, unknown>) || obj;
      const tokenType = String(payment.tokenType || payment.token || 'STX');
      const hasStacks = tokenType === 'STX' || tokenType === 'sBTC' || tokenType === 'USDCx' ||
        String(obj.network || '').includes('mainnet') || String(obj.network || '').includes('testnet');

      return {
        success: true,
        version: 'v1',
        httpStatus: 402,
        hasStacks,
        amount: String(payment.maxAmountRequired || payment.price || ''),
        payTo: String(payment.payTo || payment.recipient || ''),
        tokenType,
        raw: body,
      };
    }
  }

  return {
    success: false,
    version: null,
    httpStatus: 402,
    hasStacks: false,
    error: 'Could not parse 402 response as x402 protocol',
    raw: body,
  };
}
