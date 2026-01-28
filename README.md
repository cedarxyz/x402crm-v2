# x402 CRM v2

CRM for tracking and converting x402 developers to sBTC. Built with Hono + Cloudflare Workers + D1.

## Features

- **Pipeline tracking**: New → Contacted → Qualified → Onboarding → Converted
- **sBTC verification tracking**: Integrated with sbtc-appleseed
- **Multi-chain support**: Solana, Ethereum, Base, Multi-chain
- **Real-time stats**: Provider counts, verification metrics, sBTC sent
- **Full CRUD API**: Compatible with sbtc-appleseed CRM integration

## Architecture

```
┌─────────────────────────────────────┐
│  x402 CRM v2                        │
│  Cloudflare Worker + D1             │
├─────────────────────────────────────┤
│  GET /crm          List providers   │
│  POST /crm         Create provider  │
│  PUT /crm/:id      Update provider  │
│  GET /crm/:id      Get provider     │
│  GET /api/leads    UI-friendly list │
│  GET /api/stats    Aggregate stats  │
│  GET /             Web UI           │
└─────────────────────────────────────┘
```

## Environments

| Environment | URL | Database |
|-------------|-----|----------|
| Local | `http://localhost:8787` | x402crm-v2-local (SQLite) |
| Staging | https://x402crm-v2-staging.c3dar.workers.dev | x402crm-v2-staging |
| Production | TBD (will replace v1) | x402crm-v2 |

## Development

```bash
# Install dependencies
npm install

# Initialize local database
npm run db:migrate

# Start dev server
npm run dev

# Type check
npm run typecheck
```

## Deployment

```bash
# Deploy to staging
npm run deploy:staging

# Apply schema to remote staging DB
npm run db:migrate:remote

# Deploy to production (when ready)
npm run deploy
```

## API Compatibility

This v2 is designed to be compatible with [sbtc-appleseed](https://github.com/pbtc21/sbtc-appleseed)'s CRM integration:

```typescript
// sbtc-appleseed calls these endpoints:
GET  /crm                    // List all providers
PUT  /crm/:provider_id       // Update provider after verification
```

The PUT endpoint supports appending notes and updating verification status, which is how appleseed reports verification results.

## Database Schema

```sql
providers (
  provider_id TEXT PRIMARY KEY,
  name, company, email, twitter,
  domain, endpoint_url, chain,
  pipeline_status,
  supports_sbtc,
  notes,
  verification_status, verification_tx_id,
  sbtc_sent_total,
  issue_url,
  created_at, updated_at
)

verification_history (
  provider_id,
  timestamp, status, tx_id, amount_sats,
  error, endpoint_tested
)
```

## Migration from v1

v1 (at `x402crm-api.c3dar.workers.dev`) uses in-memory sample data. v2 uses D1 for persistence. When ready to migrate:

1. Export any real data from v1 (if any was added)
2. Import into v2 staging
3. Test with sbtc-appleseed against staging
4. Update appleseed's CRM_API to point to v2
5. Deploy v2 to production

---

Forked from [pbtc21/x402-crm](https://github.com/pbtc21/x402-crm)
