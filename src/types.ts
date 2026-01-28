/**
 * x402 CRM v2 - Type Definitions
 *
 * These types are designed to be compatible with sbtc-appleseed's expectations
 * while also supporting the UI's lead/pipeline model.
 */

// Database row type (matches D1 schema)
export interface ProviderRow {
  id: number;
  provider_id: string;
  name: string | null;
  company: string | null;
  email: string | null;
  twitter: string | null;
  domain: string | null;
  endpoint_url: string | null;
  chain: string | null;
  pipeline_status: 'new' | 'contacted' | 'qualified' | 'meeting' | 'onboarding' | 'converted' | 'lost';
  supports_sbtc: boolean;
  notes: string | null;
  estimated_mrr: number | null;
  verification_status: 'pending' | 'passed' | 'failed' | null;
  verification_tx_id: string | null;
  verification_timestamp: string | null;
  sbtc_sent_total: number;
  issue_url: string | null;
  created_at: string;
  updated_at: string;
}

// API response type for listing providers (sbtc-appleseed compatible)
export interface CrmEntry {
  provider_id: string;
  synced_data: {
    domain?: string;
    name?: string;
    company?: string;
    email?: string;
    twitter?: string;
    endpoint_url?: string;
    chain?: string;
    estimated_mrr?: number;
  };
  notes?: string;
  supports_sbtc?: boolean;
  pipeline_status?: string;
  verification_status?: string;
  verification_tx_id?: string;
  verification_timestamp?: string;
  sbtc_sent_total?: number;
  issue_url?: string;
}

// API response for GET /crm (sbtc-appleseed format)
export interface CrmListResponse {
  entries: CrmEntry[];
  total: number;
}

// Request body for PUT /crm/:id (sbtc-appleseed format)
export interface CrmUpdateRequest {
  notes?: string;
  supports_sbtc?: boolean;
  pipeline_status?: string;
  verification_status?: string;
  verification_tx_id?: string;
  sbtc_sent_total?: number;
  issue_url?: string;
  endpoint_url?: string;
}

// Request body for POST /crm (create new provider)
export interface CrmCreateRequest {
  provider_id?: string; // Auto-generated if not provided
  name?: string;
  company?: string;
  email?: string;
  twitter?: string;
  domain?: string;
  endpoint_url?: string;
  chain?: string;
  pipeline_status?: string;
  notes?: string;
  estimated_mrr?: number;
}

// UI-friendly lead type (for the frontend)
export interface Lead {
  id: number;
  provider_id: string;
  name: string;
  company: string;
  email: string;
  twitter: string;
  chain: string;
  endpoint: string;
  status: string;
  lastContact: string | null;
  notes: string;
  mrr: number;
  supports_sbtc: boolean;
  verification_status: string | null;
  verification_tx_id: string | null;
}

// Stats response
export interface CrmStats {
  total_providers: number;
  by_status: Record<string, number>;
  by_chain: Record<string, number>;
  supports_sbtc_count: number;
  verified_count: number;
  total_sbtc_sent: number;
  this_week: {
    new_providers: number;
    verifications: number;
    conversions: number;
  };
}

// Verification history entry
export interface VerificationHistoryEntry {
  timestamp: string;
  status: 'passed' | 'failed';
  tx_id: string | null;
  amount_sats: number | null;
  error: string | null;
  note: string;
}

// Cloudflare Worker environment bindings
export interface Env {
  DB: D1Database;
}
