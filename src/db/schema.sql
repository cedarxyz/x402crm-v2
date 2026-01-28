-- x402 CRM v2 - D1 Database Schema
-- Compatible with sbtc-appleseed verification workflow

-- Main providers table
CREATE TABLE IF NOT EXISTS providers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  provider_id TEXT UNIQUE NOT NULL,

  -- Contact info
  name TEXT,
  company TEXT,
  email TEXT,
  twitter TEXT,

  -- Endpoint info
  domain TEXT,
  endpoint_url TEXT,
  chain TEXT DEFAULT 'unknown',

  -- Pipeline tracking
  pipeline_status TEXT DEFAULT 'new' CHECK (
    pipeline_status IN ('new', 'contacted', 'qualified', 'meeting', 'onboarding', 'converted', 'lost')
  ),

  -- sBTC/x402 status
  supports_sbtc INTEGER DEFAULT 0,

  -- Notes (appended by appleseed verification)
  notes TEXT,

  -- Business metrics
  estimated_mrr INTEGER DEFAULT 0,

  -- Verification tracking (set by sbtc-appleseed)
  verification_status TEXT CHECK (
    verification_status IS NULL OR verification_status IN ('pending', 'passed', 'failed')
  ),
  verification_tx_id TEXT,
  verification_timestamp TEXT,
  sbtc_sent_total INTEGER DEFAULT 0,

  -- GitHub issue tracking
  issue_url TEXT,

  -- Timestamps
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Index for domain lookups (used by sbtc-appleseed to find providers)
CREATE INDEX IF NOT EXISTS idx_providers_domain ON providers(domain);

-- Index for pipeline filtering
CREATE INDEX IF NOT EXISTS idx_providers_status ON providers(pipeline_status);

-- Index for chain filtering
CREATE INDEX IF NOT EXISTS idx_providers_chain ON providers(chain);

-- Verification history table (detailed log of all verification attempts)
CREATE TABLE IF NOT EXISTS verification_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  provider_id TEXT NOT NULL,
  timestamp TEXT DEFAULT (datetime('now')),
  status TEXT NOT NULL CHECK (status IN ('passed', 'failed')),
  tx_id TEXT,
  amount_sats INTEGER,
  http_status INTEGER,
  body_length INTEGER,
  error TEXT,
  endpoint_tested TEXT,
  raw_result TEXT, -- JSON blob of full verification result

  FOREIGN KEY (provider_id) REFERENCES providers(provider_id)
);

CREATE INDEX IF NOT EXISTS idx_verification_history_provider ON verification_history(provider_id);

-- Trigger to update updated_at on provider changes
CREATE TRIGGER IF NOT EXISTS update_provider_timestamp
AFTER UPDATE ON providers
BEGIN
  UPDATE providers SET updated_at = datetime('now') WHERE id = NEW.id;
END;

-- Seed some sample data for testing (can be removed in production)
INSERT OR IGNORE INTO providers (provider_id, name, company, chain, domain, endpoint_url, pipeline_status, estimated_mrr, notes)
VALUES
  ('alex-chen-solanafi', 'Alex Chen', 'SolanaFi', 'Solana', 'api.solanafi.xyz', 'api.solanafi.xyz/v1/swap', 'qualified', 5000, 'Interested in adding BTC option. Demo scheduled.'),
  ('sarah-kim-baseswap', 'Sarah Kim', 'BaseSwap', 'Base', 'baseswap.io', 'baseswap.io/api/quote', 'contacted', 12000, 'Cold outreach. Replied interested.'),
  ('marcus-webb-ethlend', 'Marcus Webb', 'EthLend Pro', 'Ethereum', 'api.ethlendpro.com', 'api.ethlendpro.com/rates', 'converted', 8500, 'CLOSED! Added sBTC. Paying 500 sats/call.'),
  ('priya-patel-oracle', 'Priya Patel', 'DeFi Oracle', 'Multi', 'oracle.defi', 'oracle.defi/price', 'new', 25000, 'Found on x402 registry. High volume endpoint.'),
  ('jake-morrison-sniper', 'Jake Morrison', 'Solana Sniper', 'Solana', 'sniper.sol', 'sniper.sol/api/execute', 'qualified', 45000, 'Trading bot. High margin. BTC users = premium.'),
  ('emma-liu-nft', 'Emma Liu', 'NFT Analytics', 'Ethereum', 'nftanalytics.pro', 'nftanalytics.pro/api/v2', 'meeting', 3200, 'Meeting today 3pm. Preparing demo.');

-- Mark converted provider as supporting sBTC
UPDATE providers SET supports_sbtc = 1, verification_status = 'passed' WHERE provider_id = 'marcus-webb-ethlend';
