/**
 * Robinhood Alliance — shared API helper (frontend-only).
 * Auth: Authorization: Bearer ${localStorage.token}
 *
 * Expected endpoints (see /workspace/Qfs/API-CONTRACTS.md for full shapes):
 *
 * Existing (wired for real):
 *   GET  /api/user
 *   GET  /api/wallets                 → [{currency, balance}]
 *   GET  /api/transactions
 *   Admin: GET/PUT /api/admin/users[/:id], POST .../balance, etc.
 *
 * New (call; handle 404 gracefully — "API unavailable"):
 *   GET/POST /api/cards
 *   PATCH    /api/cards/:id
 *   POST     /api/cards/request       body: {} → $350 request
 *   POST     /api/admin/users/:id/cards/activate
 *   PUT      /api/admin/users/:id/cards
 *   GET/POST /api/payments            body: {type:'ach'|'wire', amount, currency, note, code?}
 *                                     → {code, status:'pending_support'}
 *   GET/POST /api/vaults
 *   PATCH    /api/vaults/:id
 *   POST     /api/swap                {from, to, amount, pin?}
 *   POST     /api/user/name           {full_name}
 *   Admin fallback: PUT /api/admin/users/:id {full_name}
 *   Admin payments: GET /api/admin/payments ; PATCH /api/admin/payments/:id
 *   Admin vaults:   GET /api/admin/users/:id/vaults
 *   Admin swaps:    GET /api/admin/swaps (audit placeholder)
 */
(function (global) {
  'use strict';

  // Prefer local upgraded API when the site is served from localhost; allow override via localStorage.ra_api_base
  var API_BASE = (function () {
    try {
      var override = localStorage.getItem('ra_api_base');
      if (override && /^https?:\/\//i.test(override)) return override.replace(/\/$/, '');
    } catch (e) {}
    try {
      var host = (global.location && location.hostname) || '';
      if (host === 'localhost' || host === '127.0.0.1') {
        return 'http://127.0.0.1:5987';
      }
    } catch (e2) {}
    return 'https://web-production-8f747.up.railway.app';
  })();

  function getToken() {
    try {
      return localStorage.getItem('token') || '';
    } catch (e) {
      return '';
    }
  }

  function authHeaders(extra) {
    var h = Object.assign(
      {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      extra || {}
    );
    var t = getToken();
    if (t) h.Authorization = 'Bearer ' + t;
    return h;
  }

  /**
   * api(path, opts)
   * @param {string} path  e.g. '/api/cards' or 'api/cards'
   * @param {object} [opts] fetch options; body objects are JSON.stringified
   * @returns {Promise<{ok, status, data, notDeployed, error, response}>}
   *
   * notDeployed === true when status is 404 (or network unreachable treated similarly).
   * Callers should show “API unavailable” / empty portal-sync state — never fake money.
   */
  async function api(path, opts) {
    opts = opts || {};
    var p = String(path || '');
    if (p.charAt(0) !== '/') p = '/' + p;
    var url = API_BASE + p;
    var init = Object.assign({}, opts);
    init.headers = authHeaders(opts.headers || {});
    if (init.body != null && typeof init.body === 'object' && !(init.body instanceof FormData)) {
      init.body = JSON.stringify(init.body);
    }
    try {
      var res = await fetch(url, init);
      var data = null;
      var text = '';
      try {
        text = await res.text();
        data = text ? JSON.parse(text) : null;
      } catch (parseErr) {
        data = text || null;
      }
      var notDeployed = res.status === 404;
      return {
        ok: res.ok,
        status: res.status,
        data: data,
        notDeployed: notDeployed,
        error: res.ok
          ? null
          : (data && (data.error || data.message)) ||
            (notDeployed ? 'API unavailable' : 'Request failed (' + res.status + ')'),
        response: res,
      };
    } catch (err) {
      return {
        ok: false,
        status: 0,
        data: null,
        notDeployed: true,
        error: err && err.message ? err.message : 'Network error — API unavailable',
        response: null,
      };
    }
  }

  function uuid() {
    if (global.crypto && typeof global.crypto.randomUUID === 'function') {
      return global.crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0;
      var v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  function maskPan(num) {
    var s = String(num || '').replace(/\s+/g, '');
    if (s.length < 4) return '•••• •••• •••• ••••';
    var last = s.slice(-4);
    return '•••• •••• •••• ' + last;
  }

  /** Dashboard asset keys (crypto + ETFs + metals). */
  var DASHBOARD_ASSETS = [
    { key: 'qfs', label: 'Quantum Financial System (QFS)', symbol: 'QFS', icon: '/assets/images/qfs.png', kind: 'crypto', cg: 'quantumfinancialsystem' },
    { key: 'btc', label: 'Bitcoin (BTC)', symbol: 'BTC', icon: '/assets/images/coin/77655.svg', kind: 'crypto', cg: 'bitcoin' },
    { key: 'eth', label: 'Ethereum (ETH)', symbol: 'ETH', icon: '/assets/images/coin/29869.svg', kind: 'crypto', cg: 'ethereum' },
    { key: 'usdt', label: 'USDT (ERC20)', symbol: 'USDT', icon: '/assets/images/coin/38081.svg', kind: 'crypto', cg: null },
    { key: 'tron', label: 'TRON (TRX)', symbol: 'TRX', icon: '/assets/images/coin/34272.svg', kind: 'crypto', cg: 'tron' },
    { key: 'bnb', label: 'BNB Smart Chain (BNB)', symbol: 'BNB', icon: '/assets/images/coin/89776.png', kind: 'crypto', cg: 'binancecoin' },
    { key: 'xrp', label: 'Ripple (XRP)', symbol: 'XRP', icon: '/assets/images/coin/52.png', kind: 'crypto', cg: 'ripple' },
    { key: 'xlm', label: 'Stellar Lumens (XLM)', symbol: 'XLM', icon: '/assets/images/coin/512.png', kind: 'crypto', cg: 'stellar' },
    { key: 'voo', label: 'Vanguard S&P 500 (VOO)', symbol: 'VOO', icon: '/assets/images/coin/voo.png', kind: 'etf', yahoo: 'VOO' },
    { key: 'vti', label: 'Vanguard Total Stock (VTI)', symbol: 'VTI', icon: '/assets/images/coin/vti.png', kind: 'etf', yahoo: 'VTI' },
    { key: 'vxus', label: 'Vanguard Total Intl (VXUS)', symbol: 'VXUS', icon: '/assets/images/coin/vxus.png', kind: 'etf', yahoo: 'VXUS' },
    { key: 'bnd', label: 'Vanguard Total Bond (BND)', symbol: 'BND', icon: '/assets/images/coin/bnd.png', kind: 'etf', yahoo: 'BND' },
    { key: 'qqq', label: 'Invesco QQQ (QQQ)', symbol: 'QQQ', icon: '/assets/images/coin/qqq.png', kind: 'etf', yahoo: 'QQQ' },
    { key: 'schd', label: 'Schwab US Dividend (SCHD)', symbol: 'SCHD', icon: '/assets/images/coin/schd.png', kind: 'etf', yahoo: 'SCHD' },
    { key: 'vt', label: 'Vanguard Total World (VT)', symbol: 'VT', icon: '/assets/images/coin/vt.png', kind: 'etf', yahoo: 'VT' },
    { key: 'vea', label: 'Vanguard FTSE Developed (VEA)', symbol: 'VEA', icon: '/assets/images/coin/vea.png', kind: 'etf', yahoo: 'VEA' },
    { key: 'vwo', label: 'Vanguard FTSE Emerging (VWO)', symbol: 'VWO', icon: '/assets/images/coin/vwo.png', kind: 'etf', yahoo: 'VWO' },
    { key: 'agg', label: 'iShares Core US Aggregate (AGG)', symbol: 'AGG', icon: '/assets/images/coin/agg.png', kind: 'etf', yahoo: 'AGG' },
    { key: 'spy', label: 'SPDR S&P 500 (SPY)', symbol: 'SPY', icon: '/assets/images/coin/spy.png', kind: 'etf', yahoo: 'SPY' },
    { key: 'ivv', label: 'iShares Core S&P 500 (IVV)', symbol: 'IVV', icon: '/assets/images/coin/ivv.png', kind: 'etf', yahoo: 'IVV' },
    { key: 'vas', label: 'Vanguard Australian Shares (VAS)', symbol: 'VAS', icon: '/assets/images/coin/vas.png', kind: 'etf', yahoo: 'VAS.AX' },
    { key: 'vgs', label: 'Vanguard Intl Shares (VGS)', symbol: 'VGS', icon: '/assets/images/coin/vgs.png', kind: 'etf', yahoo: 'VGS.AX' },
    { key: 'a200', label: 'BetaShares Australia 200 (A200)', symbol: 'A200', icon: '/assets/images/coin/a200.png', kind: 'etf', yahoo: 'A200.AX' },
    { key: 'vcn', label: 'Vanguard FTSE Canada (VCN)', symbol: 'VCN', icon: '/assets/images/coin/vcn.png', kind: 'etf', yahoo: 'VCN.TO' },
    { key: 'xic', label: 'iShares Core S&P/TSX (XIC)', symbol: 'XIC', icon: '/assets/images/coin/xic.png', kind: 'etf', yahoo: 'XIC.TO' },
    { key: 'veqt', label: 'Vanguard All-Equity (VEQT)', symbol: 'VEQT', icon: '/assets/images/coin/veqt.png', kind: 'etf', yahoo: 'VEQT.TO' },
    { key: 'gold', label: 'Gold', symbol: 'GOLD', icon: '/assets/images/coin/gold.png', kind: 'metal' },
    { key: 'silver', label: 'Silver', symbol: 'SILVER', icon: '/assets/images/coin/silver.png', kind: 'metal' },
    { key: 'platinum', label: 'Platinum', symbol: 'PLAT', icon: '/assets/images/coin/platinum.png', kind: 'metal' },
    { key: 'palladium', label: 'Palladium', symbol: 'PALL', icon: '/assets/images/coin/palladium.png', kind: 'metal' },
    { key: 'nickel', label: 'Nickel', symbol: 'NICK', icon: '/assets/images/coin/nickel.png', kind: 'metal' },
    { key: 'tin', label: 'Tin', symbol: 'TIN', icon: '/assets/images/coin/tin.png', kind: 'metal' },
    { key: 'bronze', label: 'Bronze', symbol: 'BRNZ', icon: '/assets/images/coin/bronze.png', kind: 'metal' },
    { key: 'copper', label: 'Copper', symbol: 'COPP', icon: '/assets/images/coin/copper.png', kind: 'metal' },
    { key: 'aluminum', label: 'Aluminum', symbol: 'ALUM', icon: '/assets/images/coin/aluminum.png', kind: 'metal' },
  ];

  var METAL_FALLBACK_USD = {
    gold: 2650,
    silver: 31,
    platinum: 980,
    palladium: 1000,
    nickel: 7.5,
    tin: 14.0,
    bronze: 4.5,
    copper: 4.2,
    aluminum: 1.1,
  };

  var STATIC_ETF_APPROX = {
    VOO: 520, VTI: 290, VXUS: 65, BND: 73, QQQ: 490, SCHD: 28,
    VT: 120, VEA: 52, VWO: 45, AGG: 98, SPY: 570, IVV: 570,
    'VAS.AX': 100, 'VGS.AX': 130, 'A200.AX': 135, 'VCN.TO': 50, 'XIC.TO': 35, 'VEQT.TO': 40,
  };

  var _priceCache = {};

  async function fetchYahooPrice(symbol) {
    var sym = String(symbol || '').toUpperCase();
    var cacheKey = 'yahoo:' + sym;
    if (_priceCache[cacheKey] && Date.now() - _priceCache[cacheKey].t < 5 * 60 * 1000) {
      return _priceCache[cacheKey].price;
    }
    try {
      var url =
        'https://query1.finance.yahoo.com/v8/finance/chart/' +
        encodeURIComponent(sym) +
        '?interval=1d&range=1d';
      var res = await fetch(url);
      if (!res.ok) throw new Error('yahoo ' + res.status);
      var data = await res.json();
      var meta = data && data.chart && data.chart.result && data.chart.result[0] && data.chart.result[0].meta;
      var price = meta && (meta.regularMarketPrice || meta.previousClose);
      if (price != null) {
        _priceCache[cacheKey] = { t: Date.now(), price: Number(price) };
        return Number(price);
      }
    } catch (e) {
      /* fallback below */
    }
    var fb = STATIC_ETF_APPROX[sym] || 0;
    _priceCache[cacheKey] = { t: Date.now(), price: fb };
    return fb;
  }

  /**
   * Load USD prices for all dashboard assets (CoinGecko + Yahoo + metal fallbacks).
   * @returns {Promise<Object.<string, number>>} map key → usd price
   */
  async function fetchAssetPrices() {
    var out = {};
    // Crypto via CoinGecko
    try {
      var ids = DASHBOARD_ASSETS.filter(function (a) {
        return a.cg;
      })
        .map(function (a) {
          return a.cg;
        })
        .join(',');
      if (ids) {
        var res = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=' + ids + '&vs_currencies=usd'
        );
        if (res.ok) {
          var data = await res.json();
          DASHBOARD_ASSETS.forEach(function (a) {
            if (a.cg && data[a.cg] && data[a.cg].usd != null) out[a.key] = Number(data[a.cg].usd);
          });
        }
      }
    } catch (e) {
      /* ignore */
    }
    out.usdt = out.usdt != null ? out.usdt : 1;
    // Try pax-gold for gold
    try {
      var gRes = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=pax-gold&vs_currencies=usd'
      );
      if (gRes.ok) {
        var gData = await gRes.json();
        if (gData['pax-gold'] && gData['pax-gold'].usd != null) out.gold = Number(gData['pax-gold'].usd);
      }
    } catch (e) {
      /* ignore */
    }
    // Metals fallback
    Object.keys(METAL_FALLBACK_USD).forEach(function (k) {
      if (out[k] == null) out[k] = METAL_FALLBACK_USD[k];
    });
    // ETFs via Yahoo (parallel-ish sequential for simplicity)
    for (var i = 0; i < DASHBOARD_ASSETS.length; i++) {
      var a = DASHBOARD_ASSETS[i];
      if (a.kind === 'etf' && a.yahoo) {
        out[a.key] = await fetchYahooPrice(a.yahoo);
      }
    }
    return out;
  }

  /** Empty-state helpers for portal sync shells (no mock money). */
  function portalEmptyHtml(msg) {
    msg = msg || 'History syncs from portal';
    return (
      '<div class="ra-empty-state" style="text-align:center;padding:1.25rem 0.75rem;opacity:0.75;font-size:0.85rem;">' +
      '<div style="margin-bottom:0.35rem;opacity:0.5;">—</div>' +
      '<p style="margin:0;">' +
      msg +
      '</p></div>'
    );
  }

  function apiNotDeployedHtml(feature) {
    feature = feature || 'This feature';
    return (
      '<div class="ra-api-pending" style="text-align:center;padding:1.25rem;border:1px dashed rgba(16,185,129,0.35);border-radius:12px;font-size:0.85rem;">' +
      '<strong>API unavailable</strong>' +
      '<p style="margin:0.4rem 0 0;opacity:0.7;">' +
      feature +
      ' will appear here once the service is back online.</p></div>'
    );
  }

  var BALANCE_KEY = 'ra_balance_snapshot';
  var FALLBACK_USD = {
    qfs: 1, btc: 95000, eth: 3500, usdt: 1, tron: 0.25, bnb: 600, xrp: 0.6, xlm: 0.12,
    voo: 520, vti: 290, vxus: 65, bnd: 73, qqq: 490, schd: 28, vt: 120, vea: 52, vwo: 45,
    agg: 98, spy: 570, ivv: 570, vas: 100, vgs: 130, a200: 135, vcn: 50, xic: 35, veqt: 40,
    gold: 2650, silver: 31, platinum: 980, palladium: 1000, nickel: 7.5, tin: 14, bronze: 4.5,
    copper: 4.2, aluminum: 1.1
  };

  function formatMoneyUsd(n) {
    var v = Number(n || 0);
    try {
      return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(v);
    } catch (e) {
      return '$' + v.toFixed(2);
    }
  }

  async function getWalletMap() {
    var r = await api('/api/wallets');
    var map = {};
    if (r.ok) {
      var list = Array.isArray(r.data) ? r.data : (r.data && r.data.wallets) || [];
      list.forEach(function (w) {
        if (!w || w.currency == null) return;
        map[String(w.currency).toLowerCase()] = Number(w.balance || 0);
      });
    }
    return { ok: r.ok, notDeployed: r.notDeployed, error: r.error, map: map };
  }

  /**
   * Single-source portfolio USD total from /api/wallets (+ optional vault locks).
   * QFS is valued at $1 (site convention) — never double-count with market price.
   */
  async function computePortfolioUsd(walletMap, priceMap) {
    walletMap = walletMap || {};
    priceMap = priceMap || {};
    var total = 0;
    var keys = Object.keys(walletMap);
    // ensure known assets counted even if zero
    DASHBOARD_ASSETS.forEach(function (a) {
      if (keys.indexOf(a.key) < 0) keys.push(a.key);
    });
    var seen = {};
    keys.forEach(function (key) {
      key = String(key).toLowerCase();
      if (seen[key]) return;
      seen[key] = 1;
      var amt = Number(walletMap[key] || 0);
      if (!amt) return;
      var px;
      if (key === 'qfs' || key === 'usdt') px = 1;
      else px = priceMap[key];
      if (px == null || !(px > 0)) px = FALLBACK_USD[key] || 0;
      total += amt * Number(px);
    });
    return total;
  }

  async function getVaultLockedUsd() {
    var r = await api('/api/vaults');
    var locked = 0;
    var list = [];
    if (r.ok) {
      list = Array.isArray(r.data) ? r.data : (r.data && r.data.vaults) || [];
      list.forEach(function (v) {
        locked += Number(v && v.balance != null ? v.balance : 0);
      });
    }
    return { ok: r.ok, notDeployed: r.notDeployed, locked: locked, vaults: list };
  }

  function readBalanceSnapshot() {
    try {
      var raw = localStorage.getItem(BALANCE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function writeBalanceSnapshot(snap) {
    try {
      localStorage.setItem(BALANCE_KEY, JSON.stringify(snap));
    } catch (e) {}
    try {
      global.dispatchEvent(new CustomEvent('ra-balance-updated', { detail: snap }));
    } catch (e2) {}
    return snap;
  }

  /**
   * Refresh shared balance snapshot from backend wallets + vaults.
   * Portfolio = sum(wallet balances × USD). Available ≈ portfolio − vault locked.
   */
  async function refreshSharedBalance(opts) {
    opts = opts || {};
    var w = await getWalletMap();
    var prices = opts.prices;
    if (!prices) {
      try {
        prices = await fetchAssetPrices();
      } catch (e) {
        prices = {};
      }
    }
    prices = prices || {};
    prices.qfs = 1;
    prices.usdt = 1;
    var portfolio = await computePortfolioUsd(w.map, prices);
    var vaults = await getVaultLockedUsd();
    var locked = Number(vaults.locked || 0);
    // Vault balances are USD goal buckets; treat as locked portion of portfolio when present.
    var available = Math.max(0, portfolio - locked);
    var snap = {
      t: Date.now(),
      portfolioUsd: portfolio,
      availableUsd: available,
      vaultLockedUsd: locked,
      walletMap: w.map,
      walletsOk: !!w.ok,
      vaultsOk: !!vaults.ok
    };
    return writeBalanceSnapshot(snap);
  }

  function balanceStripHtml(snap, label) {
    snap = snap || readBalanceSnapshot() || {};
    label = label || 'Account balance';
    var port = formatMoneyUsd(snap.portfolioUsd || 0);
    var avail = formatMoneyUsd(snap.availableUsd != null ? snap.availableUsd : snap.portfolioUsd || 0);
    var locked = formatMoneyUsd(snap.vaultLockedUsd || 0);
    return (
      '<div class="wallet-card mock-card glass-panel ra-balance-strip" id="raBalanceStrip" style="margin-bottom:1rem;">' +
      '<div style="font-size:0.7rem;letter-spacing:0.12em;opacity:0.7;text-transform:uppercase;">' + label + '</div>' +
      '<div style="font-size:1.55rem;font-weight:700;margin:0.25rem 0 0.55rem;" data-ra-port>' + port + '</div>' +
      '<div style="display:flex;gap:1rem;flex-wrap:wrap;font-size:0.75rem;opacity:0.85;">' +
      '<span>Available <strong data-ra-avail>' + avail + '</strong></span>' +
      '<span>In vaults <strong data-ra-locked>' + locked + '</strong></span>' +
      '</div></div>'
    );
  }

  async function mountBalanceStrip(targetEl, label) {
    if (!targetEl) return null;
    var cached = readBalanceSnapshot();
    targetEl.innerHTML = balanceStripHtml(cached, label);
    var snap = await refreshSharedBalance();
    targetEl.innerHTML = balanceStripHtml(snap, label);
    return snap;
  }

  global.RA = {
    API_BASE: API_BASE,
    getToken: getToken,
    authHeaders: authHeaders,
    api: api,
    uuid: uuid,
    maskPan: maskPan,
    DASHBOARD_ASSETS: DASHBOARD_ASSETS,
    fetchAssetPrices: fetchAssetPrices,
    portalEmptyHtml: portalEmptyHtml,
    apiNotDeployedHtml: apiNotDeployedHtml,
    formatMoneyUsd: formatMoneyUsd,
    getWalletMap: getWalletMap,
    computePortfolioUsd: computePortfolioUsd,
    getVaultLockedUsd: getVaultLockedUsd,
    readBalanceSnapshot: readBalanceSnapshot,
    writeBalanceSnapshot: writeBalanceSnapshot,
    refreshSharedBalance: refreshSharedBalance,
    balanceStripHtml: balanceStripHtml,
    mountBalanceStrip: mountBalanceStrip,
    BALANCE_KEY: BALANCE_KEY,
  };
})(typeof window !== 'undefined' ? window : this);
