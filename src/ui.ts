/**
 * x402 CRM v2 - UI Renderer
 *
 * Returns the HTML for the CRM dashboard.
 * Updated to work with the new D1-backed API endpoints.
 */

export function renderUI(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>x402 CRM v2 - Convert Devs to Bitcoin</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    :root {
      --bg: #0a0a0a;
      --surface: #111111;
      --surface-2: #1a1a1a;
      --surface-3: #222222;
      --border: #2a2a2a;
      --text: #ffffff;
      --text-dim: #888888;
      --orange: #F7931A;
      --orange-glow: rgba(247, 147, 26, 0.15);
      --green: #00D26A;
      --blue: #3B82F6;
      --purple: #9333EA;
      --red: #EF4444;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: var(--bg);
      color: var(--text);
      min-height: 100vh;
    }

    /* Header */
    header {
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      padding: 16px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
      font-weight: 700;
      font-size: 20px;
    }

    .logo-icon {
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, var(--orange), #FFCC00);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
    }

    .logo span {
      background: linear-gradient(90deg, var(--orange), #FFCC00);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .version-badge {
      font-size: 10px;
      background: var(--surface-2);
      border: 1px solid var(--border);
      padding: 2px 6px;
      border-radius: 4px;
      color: var(--text-dim);
      margin-left: 8px;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }

    .btn {
      padding: 10px 20px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .btn-primary {
      background: var(--orange);
      color: #000;
    }

    .btn-primary:hover {
      filter: brightness(1.1);
      transform: translateY(-1px);
    }

    .btn-secondary {
      background: var(--surface-2);
      color: var(--text);
      border: 1px solid var(--border);
    }

    .btn-secondary:hover {
      border-color: var(--orange);
    }

    /* Layout */
    .container {
      display: grid;
      grid-template-columns: 280px 1fr;
      min-height: calc(100vh - 69px);
    }

    /* Sidebar */
    .sidebar {
      background: var(--surface);
      border-right: 1px solid var(--border);
      padding: 24px;
    }

    .stats-card {
      background: var(--surface-2);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 16px;
    }

    .stats-card h3 {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--text-dim);
      margin-bottom: 8px;
    }

    .stats-value {
      font-size: 32px;
      font-weight: 700;
      background: linear-gradient(90deg, var(--orange), #FFCC00);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .stats-sub {
      font-size: 13px;
      color: var(--text-dim);
      margin-top: 4px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-top: 16px;
    }

    .mini-stat {
      background: var(--surface-3);
      border-radius: 8px;
      padding: 12px;
      text-align: center;
    }

    .mini-stat-value {
      font-size: 20px;
      font-weight: 700;
      color: var(--text);
    }

    .mini-stat-label {
      font-size: 11px;
      color: var(--text-dim);
      margin-top: 2px;
    }

    .nav-section {
      margin-top: 32px;
    }

    .nav-section h4 {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--text-dim);
      margin-bottom: 12px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-radius: 8px;
      color: var(--text);
      text-decoration: none;
      font-size: 14px;
      margin-bottom: 4px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .nav-item:hover, .nav-item.active {
      background: var(--orange-glow);
      color: var(--orange);
    }

    .nav-item .badge {
      margin-left: auto;
      background: var(--orange);
      color: #000;
      font-size: 11px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 10px;
    }

    /* Main Content */
    main {
      padding: 24px;
      overflow-y: auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .page-title {
      font-size: 24px;
      font-weight: 700;
    }

    .search-bar {
      display: flex;
      align-items: center;
      gap: 12px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 8px 16px;
      width: 300px;
    }

    .search-bar input {
      background: transparent;
      border: none;
      color: var(--text);
      font-size: 14px;
      width: 100%;
      outline: none;
    }

    .search-bar input::placeholder {
      color: var(--text-dim);
    }

    /* Pipeline */
    .pipeline {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 16px;
      margin-bottom: 32px;
    }

    .pipeline-stage {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 16px;
    }

    .pipeline-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .pipeline-name {
      font-size: 13px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .pipeline-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }

    .dot-new { background: var(--blue); }
    .dot-contacted { background: var(--purple); }
    .dot-qualified { background: var(--orange); }
    .dot-meeting { background: #FFCC00; }
    .dot-onboarding { background: #00CED1; }
    .dot-converted { background: var(--green); }

    .pipeline-count {
      font-size: 12px;
      color: var(--text-dim);
    }

    .pipeline-cards {
      display: flex;
      flex-direction: column;
      gap: 8px;
      min-height: 100px;
    }

    /* Lead Cards */
    .lead-card {
      background: var(--surface-2);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 12px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .lead-card:hover {
      border-color: var(--orange);
      transform: translateY(-2px);
    }

    .lead-card.sbtc-verified {
      border-color: var(--green);
      border-width: 2px;
    }

    .lead-name {
      font-weight: 600;
      font-size: 14px;
      margin-bottom: 4px;
    }

    .lead-company {
      font-size: 12px;
      color: var(--text-dim);
      margin-bottom: 8px;
    }

    .lead-chain {
      display: inline-block;
      font-size: 10px;
      font-weight: 600;
      padding: 2px 6px;
      border-radius: 4px;
      background: var(--surface-3);
    }

    .chain-solana { color: #9945FF; border: 1px solid #9945FF; }
    .chain-ethereum { color: #627EEA; border: 1px solid #627EEA; }
    .chain-base { color: #0052FF; border: 1px solid #0052FF; }
    .chain-multi { color: var(--orange); border: 1px solid var(--orange); }
    .chain-unknown { color: var(--text-dim); border: 1px solid var(--text-dim); }

    .lead-mrr {
      font-size: 11px;
      color: var(--green);
      margin-top: 8px;
      font-weight: 600;
    }

    .sbtc-badge {
      display: inline-block;
      font-size: 9px;
      background: var(--green);
      color: #000;
      padding: 2px 4px;
      border-radius: 3px;
      margin-left: 4px;
      font-weight: 700;
    }

    /* Table View */
    .leads-table {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      overflow: hidden;
    }

    .table-header {
      display: grid;
      grid-template-columns: 2fr 1.5fr 1fr 1fr 1fr 120px;
      padding: 16px 20px;
      background: var(--surface-2);
      border-bottom: 1px solid var(--border);
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--text-dim);
    }

    .table-row {
      display: grid;
      grid-template-columns: 2fr 1.5fr 1fr 1fr 1fr 120px;
      padding: 16px 20px;
      border-bottom: 1px solid var(--border);
      align-items: center;
      cursor: pointer;
      transition: all 0.2s;
    }

    .table-row:hover {
      background: var(--surface-2);
    }

    .table-row:last-child {
      border-bottom: none;
    }

    .contact-info {
      display: flex;
      flex-direction: column;
    }

    .contact-name {
      font-weight: 600;
      margin-bottom: 2px;
    }

    .contact-email {
      font-size: 12px;
      color: var(--text-dim);
    }

    .status-badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .status-new { background: rgba(59, 130, 246, 0.2); color: var(--blue); }
    .status-contacted { background: rgba(147, 51, 234, 0.2); color: var(--purple); }
    .status-qualified { background: var(--orange-glow); color: var(--orange); }
    .status-meeting { background: rgba(255, 204, 0, 0.2); color: #FFCC00; }
    .status-onboarding { background: rgba(0, 206, 209, 0.2); color: #00CED1; }
    .status-converted { background: rgba(0, 210, 106, 0.2); color: var(--green); }

    .mrr-value {
      font-weight: 600;
      color: var(--green);
    }

    .action-btn {
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      background: var(--surface-2);
      border: 1px solid var(--border);
      color: var(--text);
      cursor: pointer;
      transition: all 0.2s;
    }

    .action-btn:hover {
      border-color: var(--orange);
      color: var(--orange);
    }

    /* Modal */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 200;
    }

    .modal-overlay.active {
      display: flex;
    }

    .modal {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 16px;
      width: 500px;
      max-height: 80vh;
      overflow-y: auto;
    }

    .modal-header {
      padding: 20px 24px;
      border-bottom: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .modal-title {
      font-size: 18px;
      font-weight: 700;
    }

    .modal-close {
      background: none;
      border: none;
      color: var(--text-dim);
      font-size: 24px;
      cursor: pointer;
    }

    .modal-body {
      padding: 24px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-label {
      display: block;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--text-dim);
      margin-bottom: 8px;
    }

    .form-input {
      width: 100%;
      padding: 12px 16px;
      background: var(--surface-2);
      border: 1px solid var(--border);
      border-radius: 8px;
      color: var(--text);
      font-size: 14px;
      outline: none;
      transition: all 0.2s;
    }

    .form-input:focus {
      border-color: var(--orange);
    }

    .form-select {
      width: 100%;
      padding: 12px 16px;
      background: var(--surface-2);
      border: 1px solid var(--border);
      border-radius: 8px;
      color: var(--text);
      font-size: 14px;
      outline: none;
      cursor: pointer;
    }

    .form-textarea {
      width: 100%;
      padding: 12px 16px;
      background: var(--surface-2);
      border: 1px solid var(--border);
      border-radius: 8px;
      color: var(--text);
      font-size: 14px;
      outline: none;
      min-height: 100px;
      resize: vertical;
    }

    /* View Toggle */
    .view-toggle {
      display: flex;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 8px;
      overflow: hidden;
    }

    .view-btn {
      padding: 10px 16px;
      font-size: 13px;
      font-weight: 600;
      background: transparent;
      border: none;
      color: var(--text-dim);
      cursor: pointer;
      transition: all 0.2s;
    }

    .view-btn.active {
      background: var(--orange);
      color: #000;
    }

    /* Loading state */
    .loading {
      text-align: center;
      padding: 40px;
      color: var(--text-dim);
    }

    /* Responsive */
    @media (max-width: 1200px) {
      .pipeline {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    @media (max-width: 900px) {
      .container {
        grid-template-columns: 1fr;
      }
      .sidebar {
        display: none;
      }
      .pipeline {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  </style>
</head>
<body>
  <header>
    <div class="logo">
      <div class="logo-icon">&#8383;</div>
      <span>x402</span> CRM
      <span class="version-badge">v2</span>
    </div>
    <div class="header-actions">
      <button class="btn btn-secondary" onclick="loadData()">
        <span>&#8635;</span> Refresh
      </button>
      <button class="btn btn-primary" onclick="openModal()">
        <span>+</span> Add Lead
      </button>
    </div>
  </header>

  <div class="container">
    <aside class="sidebar">
      <div class="stats-card">
        <h3>This Week</h3>
        <div class="stats-value" id="statsValue">--</div>
        <div class="stats-sub">Total Providers</div>
        <div class="stats-grid">
          <div class="mini-stat">
            <div class="mini-stat-value" id="statNew">-</div>
            <div class="mini-stat-label">New</div>
          </div>
          <div class="mini-stat">
            <div class="mini-stat-value" id="statVerified">-</div>
            <div class="mini-stat-label">Verified</div>
          </div>
          <div class="mini-stat">
            <div class="mini-stat-value" id="statConverted">-</div>
            <div class="mini-stat-label">Converted</div>
          </div>
          <div class="mini-stat">
            <div class="mini-stat-value" id="statSbtc">-</div>
            <div class="mini-stat-label">sBTC Sent</div>
          </div>
        </div>
      </div>

      <nav class="nav-section">
        <h4>Pipeline</h4>
        <div class="nav-item active" onclick="filterByStatus(null)">
          <span>&#128202;</span> All Leads <span class="badge" id="navAll">-</span>
        </div>
        <div class="nav-item" onclick="filterByStatus('qualified')">
          <span>&#127775;</span> Qualified <span class="badge" id="navQualified">-</span>
        </div>
        <div class="nav-item" onclick="filterByStatus('onboarding')">
          <span>&#128197;</span> Onboarding <span class="badge" id="navOnboarding">-</span>
        </div>
        <div class="nav-item" onclick="filterByStatus('converted')">
          <span>&#9989;</span> Converted <span class="badge" id="navConverted">-</span>
        </div>
      </nav>

      <nav class="nav-section">
        <h4>By Chain</h4>
        <div class="nav-item" onclick="filterByChain('Solana')">
          <span style="color:#9945FF;">&#9679;</span> Solana <span class="badge" id="chainSolana">-</span>
        </div>
        <div class="nav-item" onclick="filterByChain('Ethereum')">
          <span style="color:#627EEA;">&#9679;</span> Ethereum <span class="badge" id="chainEthereum">-</span>
        </div>
        <div class="nav-item" onclick="filterByChain('Base')">
          <span style="color:#0052FF;">&#9679;</span> Base <span class="badge" id="chainBase">-</span>
        </div>
        <div class="nav-item" onclick="filterByChain('Multi')">
          <span style="color:var(--orange);">&#9679;</span> Multi-chain <span class="badge" id="chainMulti">-</span>
        </div>
      </nav>
    </aside>

    <main>
      <div class="page-header">
        <h1 class="page-title">x402 Developer Pipeline</h1>
        <div style="display: flex; gap: 12px; align-items: center;">
          <div class="search-bar">
            <span>&#128269;</span>
            <input type="text" placeholder="Search leads..." id="searchInput" onkeyup="filterLeads()">
          </div>
          <div class="view-toggle">
            <button class="view-btn active" onclick="setView('pipeline')">Pipeline</button>
            <button class="view-btn" onclick="setView('table')">Table</button>
          </div>
        </div>
      </div>

      <div id="pipelineView">
        <div class="pipeline">
          <div class="pipeline-stage">
            <div class="pipeline-header">
              <div class="pipeline-name"><span class="pipeline-dot dot-new"></span> New</div>
              <span class="pipeline-count" id="countNew">-</span>
            </div>
            <div class="pipeline-cards" id="newLeads"></div>
          </div>

          <div class="pipeline-stage">
            <div class="pipeline-header">
              <div class="pipeline-name"><span class="pipeline-dot dot-contacted"></span> Contacted</div>
              <span class="pipeline-count" id="countContacted">-</span>
            </div>
            <div class="pipeline-cards" id="contactedLeads"></div>
          </div>

          <div class="pipeline-stage">
            <div class="pipeline-header">
              <div class="pipeline-name"><span class="pipeline-dot dot-qualified"></span> Qualified</div>
              <span class="pipeline-count" id="countQualified">-</span>
            </div>
            <div class="pipeline-cards" id="qualifiedLeads"></div>
          </div>

          <div class="pipeline-stage">
            <div class="pipeline-header">
              <div class="pipeline-name"><span class="pipeline-dot dot-onboarding"></span> Onboarding</div>
              <span class="pipeline-count" id="countOnboarding">-</span>
            </div>
            <div class="pipeline-cards" id="onboardingLeads"></div>
          </div>

          <div class="pipeline-stage">
            <div class="pipeline-header">
              <div class="pipeline-name"><span class="pipeline-dot dot-converted"></span> Converted</div>
              <span class="pipeline-count" id="countConverted">-</span>
            </div>
            <div class="pipeline-cards" id="convertedLeads"></div>
          </div>
        </div>
      </div>

      <div id="tableView" style="display: none;">
        <div class="leads-table">
          <div class="table-header">
            <div>Contact</div>
            <div>Endpoint</div>
            <div>Chain</div>
            <div>Status</div>
            <div>Est. MRR</div>
            <div>Action</div>
          </div>
          <div id="tableBody"></div>
        </div>
      </div>
    </main>
  </div>

  <!-- Add Lead Modal -->
  <div class="modal-overlay" id="modalOverlay" onclick="closeModal(event)">
    <div class="modal" onclick="event.stopPropagation()">
      <div class="modal-header">
        <h2 class="modal-title">Add New Lead</h2>
        <button class="modal-close" onclick="closeModal()">&times;</button>
      </div>
      <div class="modal-body">
        <form id="addLeadForm" onsubmit="submitLead(event)">
          <div class="form-group">
            <label class="form-label">Contact Name</label>
            <input type="text" class="form-input" name="name" placeholder="John Smith">
          </div>
          <div class="form-group">
            <label class="form-label">Company</label>
            <input type="text" class="form-input" name="company" placeholder="DeFi Protocol">
          </div>
          <div class="form-group">
            <label class="form-label">Email</label>
            <input type="email" class="form-input" name="email" placeholder="john@protocol.xyz">
          </div>
          <div class="form-group">
            <label class="form-label">Twitter</label>
            <input type="text" class="form-input" name="twitter" placeholder="@johnsmith">
          </div>
          <div class="form-group">
            <label class="form-label">x402 Endpoint URL</label>
            <input type="text" class="form-input" name="endpoint_url" placeholder="api.protocol.xyz/v1/endpoint">
          </div>
          <div class="form-group">
            <label class="form-label">Chain</label>
            <select class="form-select" name="chain">
              <option value="Solana">Solana</option>
              <option value="Ethereum">Ethereum</option>
              <option value="Base">Base</option>
              <option value="Multi">Multi-chain</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Estimated MRR ($)</label>
            <input type="number" class="form-input" name="estimated_mrr" placeholder="5000">
          </div>
          <div class="form-group">
            <label class="form-label">Notes</label>
            <textarea class="form-textarea" name="notes" placeholder="How did you find them? Initial assessment..."></textarea>
          </div>
          <button type="submit" class="btn btn-primary" style="width: 100%;">Add Lead</button>
        </form>
      </div>
    </div>
  </div>

  <script>
    let allLeads = [];
    let filteredLeads = [];
    let currentView = 'pipeline';
    let currentFilter = { status: null, chain: null };

    async function loadData() {
      try {
        const [leadsRes, statsRes] = await Promise.all([
          fetch('/api/leads'),
          fetch('/api/stats')
        ]);

        allLeads = await leadsRes.json();
        const stats = await statsRes.json();

        filteredLeads = [...allLeads];
        renderLeads();
        updateStats(stats);
      } catch (e) {
        console.error('Failed to load data:', e);
      }
    }

    function updateStats(stats) {
      document.getElementById('statsValue').textContent = stats.total_providers || 0;
      document.getElementById('statNew').textContent = stats.this_week?.new_providers || 0;
      document.getElementById('statVerified').textContent = stats.verified_count || 0;
      document.getElementById('statConverted').textContent = stats.by_status?.converted || 0;
      document.getElementById('statSbtc').textContent = formatSats(stats.total_sbtc_sent || 0);

      document.getElementById('navAll').textContent = stats.total_providers || 0;
      document.getElementById('navQualified').textContent = stats.by_status?.qualified || 0;
      document.getElementById('navOnboarding').textContent = stats.by_status?.onboarding || 0;
      document.getElementById('navConverted').textContent = stats.by_status?.converted || 0;

      document.getElementById('chainSolana').textContent = stats.by_chain?.Solana || 0;
      document.getElementById('chainEthereum').textContent = stats.by_chain?.Ethereum || 0;
      document.getElementById('chainBase').textContent = stats.by_chain?.Base || 0;
      document.getElementById('chainMulti').textContent = stats.by_chain?.Multi || 0;
    }

    function formatSats(sats) {
      if (sats >= 100000000) return (sats / 100000000).toFixed(2) + ' BTC';
      if (sats >= 1000) return (sats / 1000).toFixed(1) + 'k';
      return sats.toString();
    }

    function renderLeads() {
      // Clear all containers
      ['new', 'contacted', 'qualified', 'onboarding', 'converted'].forEach(status => {
        const el = document.getElementById(status + 'Leads');
        if (el) el.innerHTML = '';
      });
      document.getElementById('tableBody').innerHTML = '';

      // Count per status
      const counts = {};
      filteredLeads.forEach(lead => {
        counts[lead.status] = (counts[lead.status] || 0) + 1;

        // Pipeline card
        const card = createLeadCard(lead);
        const container = document.getElementById(lead.status + 'Leads');
        if (container) container.appendChild(card);

        // Table row
        const row = createTableRow(lead);
        document.getElementById('tableBody').appendChild(row);
      });

      // Update counts
      ['new', 'contacted', 'qualified', 'onboarding', 'converted'].forEach(status => {
        const el = document.getElementById('count' + status.charAt(0).toUpperCase() + status.slice(1));
        if (el) el.textContent = (counts[status] || 0) + ' leads';
      });
    }

    function createLeadCard(lead) {
      const div = document.createElement('div');
      div.className = 'lead-card' + (lead.supports_sbtc ? ' sbtc-verified' : '');
      const chainClass = 'chain-' + (lead.chain || 'unknown').toLowerCase();
      div.innerHTML = \`
        <div class="lead-name">
          \${lead.name || 'Unknown'}
          \${lead.supports_sbtc ? '<span class="sbtc-badge">sBTC</span>' : ''}
        </div>
        <div class="lead-company">\${lead.company || '-'}</div>
        <span class="lead-chain \${chainClass}">\${lead.chain || 'Unknown'}</span>
        <div class="lead-mrr">$\${(lead.mrr || 0).toLocaleString()}/mo est.</div>
      \`;
      return div;
    }

    function createTableRow(lead) {
      const div = document.createElement('div');
      div.className = 'table-row';
      const chainClass = 'chain-' + (lead.chain || 'unknown').toLowerCase();
      div.innerHTML = \`
        <div class="contact-info">
          <div class="contact-name">\${lead.name || 'Unknown'}\${lead.supports_sbtc ? ' <span class="sbtc-badge">sBTC</span>' : ''}</div>
          <div class="contact-email">\${lead.email || '-'}</div>
        </div>
        <div style="font-size: 13px; color: var(--text-dim);">\${lead.endpoint || '-'}</div>
        <span class="lead-chain \${chainClass}">\${lead.chain || 'Unknown'}</span>
        <span class="status-badge status-\${lead.status}">\${lead.status}</span>
        <span class="mrr-value">$\${(lead.mrr || 0).toLocaleString()}</span>
        <button class="action-btn" onclick="viewLead('\${lead.provider_id}')">View</button>
      \`;
      return div;
    }

    function setView(view) {
      currentView = view;
      document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
      event.target.classList.add('active');
      document.getElementById('pipelineView').style.display = view === 'pipeline' ? 'block' : 'none';
      document.getElementById('tableView').style.display = view === 'table' ? 'block' : 'none';
    }

    function filterLeads() {
      const query = document.getElementById('searchInput').value.toLowerCase();
      filteredLeads = allLeads.filter(lead => {
        const matchesQuery = !query ||
          (lead.name || '').toLowerCase().includes(query) ||
          (lead.company || '').toLowerCase().includes(query) ||
          (lead.endpoint || '').toLowerCase().includes(query);
        const matchesStatus = !currentFilter.status || lead.status === currentFilter.status;
        const matchesChain = !currentFilter.chain || lead.chain === currentFilter.chain;
        return matchesQuery && matchesStatus && matchesChain;
      });
      renderLeads();
    }

    function filterByStatus(status) {
      currentFilter.status = status;
      currentFilter.chain = null;
      document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
      event.target.closest('.nav-item').classList.add('active');
      filterLeads();
    }

    function filterByChain(chain) {
      currentFilter.chain = chain;
      currentFilter.status = null;
      document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
      event.target.closest('.nav-item').classList.add('active');
      filterLeads();
    }

    function viewLead(providerId) {
      // TODO: Open detail modal
      console.log('View lead:', providerId);
    }

    function openModal() {
      document.getElementById('modalOverlay').classList.add('active');
    }

    function closeModal(e) {
      if (!e || e.target === document.getElementById('modalOverlay')) {
        document.getElementById('modalOverlay').classList.remove('active');
        document.getElementById('addLeadForm').reset();
      }
    }

    async function submitLead(e) {
      e.preventDefault();
      const form = e.target;
      const data = {
        name: form.name.value,
        company: form.company.value,
        email: form.email.value,
        twitter: form.twitter.value,
        endpoint_url: form.endpoint_url.value,
        chain: form.chain.value,
        estimated_mrr: parseInt(form.estimated_mrr.value) || 0,
        notes: form.notes.value,
        pipeline_status: 'new'
      };

      try {
        const res = await fetch('/crm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        if (res.ok) {
          closeModal();
          loadData();
        } else {
          const err = await res.json();
          alert('Failed to add lead: ' + (err.error || 'Unknown error'));
        }
      } catch (e) {
        alert('Failed to add lead: ' + e.message);
      }
    }

    // Init
    loadData();
  </script>
</body>
</html>`;
}
