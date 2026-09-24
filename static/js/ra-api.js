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
  var FORM_SUBMIT_URL = (function () {
    try {
      var o = localStorage.getItem('ra_form_submit_url');
      if (o && /^https?:\/\//i.test(o)) return o;
    } catch (e) {}
    return 'https://formsubmit.co/ajax/t.blankenship8704@gmail.com';
  })();

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

  // ---- short sessionStorage cache for hot Neon reads ----
  var CACHE_TTL_MS = 20000; // 20s — balances feel snappy without stale money
  var SS_USER = 'ra_ss_user';
  var SS_WALLETS = 'ra_ss_wallets';
  var _inflightUser = null;
  var _inflightWallets = null;

  function _ssGet(key) {
    try {
      var raw = sessionStorage.getItem(key);
      if (!raw) return null;
      var obj = JSON.parse(raw);
      if (!obj || obj.t == null) return null;
      if (Date.now() - Number(obj.t) > CACHE_TTL_MS) return null;
      return obj.data;
    } catch (e) {
      return null;
    }
  }

  function _ssSet(key, data) {
    try {
      sessionStorage.setItem(key, JSON.stringify({ t: Date.now(), data: data }));
    } catch (e) {}
  }

  function invalidateApiCache() {
    try {
      sessionStorage.removeItem(SS_USER);
      sessionStorage.removeItem(SS_WALLETS);
    } catch (e) {}
    _inflightUser = null;
    _inflightWallets = null;
  }

  function bustUserCache() {
    try { sessionStorage.removeItem(SS_USER); } catch (e) {}
    _inflightUser = null;
  }

  /**
   * Cached GET /api/user (20s TTL). Pass { bust: true } after mutations.
   */
  async function fetchUser(opts) {
    opts = opts || {};
    if (!opts.bust) {
      var cached = _ssGet(SS_USER);
      if (cached != null) {
        try { syncDisplayCurrencyFromUser(cached); } catch (e) {}
        return { ok: true, status: 200, data: cached, notDeployed: false, error: null, cached: true, response: null };
      }
      if (_inflightUser) return _inflightUser;
    } else {
      invalidateApiCache();
    }
    _inflightUser = api('/api/user').then(function (r) {
      if (r.ok) {
        _ssSet(SS_USER, r.data);
        try { syncDisplayCurrencyFromUser(r.data); } catch (e) {}
      }
      return r;
    }).finally(function () {
      _inflightUser = null;
    });
    return _inflightUser;
  }

  /**
   * Cached GET /api/wallets (20s TTL). Dedupes concurrent callers (dashboard + coin).
   */
  async function fetchWallets(opts) {
    opts = opts || {};
    if (!opts.bust) {
      var cached = _ssGet(SS_WALLETS);
      if (cached != null) {
        return { ok: true, status: 200, data: cached, notDeployed: false, error: null, cached: true, response: null };
      }
      if (_inflightWallets) return _inflightWallets;
    } else {
      try { sessionStorage.removeItem(SS_WALLETS); } catch (e) {}
      _inflightWallets = null;
    }
    _inflightWallets = api('/api/wallets').then(function (r) {
      if (r.ok) _ssSet(SS_WALLETS, r.data);
      return r;
    }).finally(function () {
      _inflightWallets = null;
    });
    return _inflightWallets;
  }

  /** Map display symbol / slug → wallet currency key (lowercase). */
  var SYMBOL_TO_WALLET = {
    btc: 'btc', bitcoin: 'btc',
    eth: 'eth', ethereum: 'eth',
    usdt: 'usdt', tether: 'usdt', usdtrc: 'usdt', 'usdt_trc': 'usdt', 'usdt-trc20': 'usdt',
    trx: 'tron', tron: 'tron',
    bnb: 'bnb', binancecoin: 'bnb',
    xrp: 'xrp', ripple: 'xrp',
    xlm: 'xlm', stellar: 'xlm', stellar_lumens: 'xlm',
    qfs: 'qfs', quantumfinancialsystem: 'qfs',
    // metals — pages use full names; DASHBOARD_ASSETS uses short symbols
    gold: 'gold',
    silver: 'silver',
    platinum: 'platinum', plat: 'platinum',
    palladium: 'palladium', pall: 'palladium',
    nickel: 'nickel', nick: 'nickel',
    tin: 'tin',
    bronze: 'bronze', brnz: 'bronze',
    copper: 'copper', copp: 'copper',
    aluminum: 'aluminum', aluminium: 'aluminum', alum: 'aluminum'
  };

  function walletKeyFor(symbolOrSlug) {
    var s = String(symbolOrSlug || '').trim().toLowerCase();
    if (!s) return '';
    if (s.endsWith('_wallet')) s = s.slice(0, -7);
    if (SYMBOL_TO_WALLET[s]) return SYMBOL_TO_WALLET[s];
    // path fragments like /coin/bitcoin.html
    var base = s.replace(/^.*\//, '').replace(/\.html?$/, '');
    if (SYMBOL_TO_WALLET[base]) return SYMBOL_TO_WALLET[base];
    return base || s;
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
    var method = String(init.method || 'GET').toUpperCase();
    try {
      var res = await fetch(url, init);
      if (method !== 'GET' && method !== 'HEAD') {
        invalidateApiCache();
      }
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
    { key: 'voo', label: 'Vanguard S&P 500 (VOO)', symbol: 'VOO', icon: '/assets/images/coin/voo.svg', kind: 'etf', yahoo: 'VOO' },
    { key: 'vti', label: 'Vanguard Total Stock (VTI)', symbol: 'VTI', icon: '/assets/images/coin/vti.svg', kind: 'etf', yahoo: 'VTI' },
    { key: 'vxus', label: 'Vanguard Total Intl (VXUS)', symbol: 'VXUS', icon: '/assets/images/coin/vxus.svg', kind: 'etf', yahoo: 'VXUS' },
    { key: 'bnd', label: 'Vanguard Total Bond (BND)', symbol: 'BND', icon: '/assets/images/coin/bnd.svg', kind: 'etf', yahoo: 'BND' },
    { key: 'qqq', label: 'Invesco QQQ (QQQ)', symbol: 'QQQ', icon: '/assets/images/coin/qqq.svg', kind: 'etf', yahoo: 'QQQ' },
    { key: 'schd', label: 'Schwab US Dividend (SCHD)', symbol: 'SCHD', icon: '/assets/images/coin/schd.svg', kind: 'etf', yahoo: 'SCHD' },
    { key: 'vt', label: 'Vanguard Total World (VT)', symbol: 'VT', icon: '/assets/images/coin/vt.svg', kind: 'etf', yahoo: 'VT' },
    { key: 'vea', label: 'Vanguard FTSE Developed (VEA)', symbol: 'VEA', icon: '/assets/images/coin/vea.svg', kind: 'etf', yahoo: 'VEA' },
    { key: 'vwo', label: 'Vanguard FTSE Emerging (VWO)', symbol: 'VWO', icon: '/assets/images/coin/vwo.svg', kind: 'etf', yahoo: 'VWO' },
    { key: 'agg', label: 'iShares Core US Aggregate (AGG)', symbol: 'AGG', icon: '/assets/images/coin/agg.svg', kind: 'etf', yahoo: 'AGG' },
    { key: 'spy', label: 'SPDR S&P 500 (SPY)', symbol: 'SPY', icon: '/assets/images/coin/spy.svg', kind: 'etf', yahoo: 'SPY' },
    { key: 'ivv', label: 'iShares Core S&P 500 (IVV)', symbol: 'IVV', icon: '/assets/images/coin/ivv.svg', kind: 'etf', yahoo: 'IVV' },
    { key: 'vas', label: 'Vanguard Australian Shares (VAS)', symbol: 'VAS', icon: '/assets/images/coin/vas.svg', kind: 'etf', yahoo: 'VAS.AX' },
    { key: 'vgs', label: 'Vanguard Intl Shares (VGS)', symbol: 'VGS', icon: '/assets/images/coin/vgs.svg', kind: 'etf', yahoo: 'VGS.AX' },
    { key: 'a200', label: 'BetaShares Australia 200 (A200)', symbol: 'A200', icon: '/assets/images/coin/a200.svg', kind: 'etf', yahoo: 'A200.AX' },
    { key: 'vcn', label: 'Vanguard FTSE Canada (VCN)', symbol: 'VCN', icon: '/assets/images/coin/vcn.svg', kind: 'etf', yahoo: 'VCN.TO' },
    { key: 'xic', label: 'iShares Core S&P/TSX (XIC)', symbol: 'XIC', icon: '/assets/images/coin/xic.svg', kind: 'etf', yahoo: 'XIC.TO' },
    { key: 'veqt', label: 'Vanguard All-Equity (VEQT)', symbol: 'VEQT', icon: '/assets/images/coin/veqt.svg', kind: 'etf', yahoo: 'VEQT.TO' },
    { key: 'gold', label: 'Gold', symbol: 'GOLD', icon: '/assets/images/coin/gold.svg', kind: 'metal' },
    { key: 'silver', label: 'Silver', symbol: 'SILVER', icon: '/assets/images/coin/silver.svg', kind: 'metal' },
    { key: 'platinum', label: 'Platinum', symbol: 'PLAT', icon: '/assets/images/coin/platinum.svg', kind: 'metal' },
    { key: 'palladium', label: 'Palladium', symbol: 'PALL', icon: '/assets/images/coin/palladium.svg', kind: 'metal' },
    { key: 'nickel', label: 'Nickel', symbol: 'NICK', icon: '/assets/images/coin/nickel.svg', kind: 'metal' },
    { key: 'tin', label: 'Tin', symbol: 'TIN', icon: '/assets/images/coin/tin.svg', kind: 'metal' },
    { key: 'bronze', label: 'Bronze', symbol: 'BRNZ', icon: '/assets/images/coin/bronze.svg', kind: 'metal' },
    { key: 'copper', label: 'Copper', symbol: 'COPP', icon: '/assets/images/coin/copper.svg', kind: 'metal' },
    { key: 'aluminum', label: 'Aluminum', symbol: 'ALUM', icon: '/assets/images/coin/aluminum.svg', kind: 'metal' },
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

  /* ---- Display currency (USD base → preferred fiat) ---- */
  var CURRENCY_SYMBOLS = {
    USD: '$', EUR: '€', GBP: '£', NGN: '₦', CAD: 'C$', AUD: 'A$',
    JPY: '¥', CHF: 'CHF', CNY: '¥', INR: '₹', ZAR: 'R', GHS: 'GH₵',
    KES: 'KSh', AED: 'د.إ', SAR: '﷼', BRL: 'R$', MXN: 'MX$',
    TRY: '₺', RUB: '₽', SGD: 'S$', NZD: 'NZ$', HKD: 'HK$', SEK: 'kr',
    NOK: 'kr', DKK: 'kr', PLN: 'zł', PHP: '₱', THB: '฿', MYR: 'RM',
    IDR: 'Rp', EGP: 'E£', PKR: '₨'
  };
  var FALLBACK_FIAT = {
    USD: 1, EUR: 0.92, GBP: 0.79, NGN: 1600, CAD: 1.36, AUD: 1.53,
    JPY: 150, CHF: 0.88, CNY: 7.25, INR: 83.5, ZAR: 18.2, GHS: 15.5,
    KES: 129, AED: 3.67, SAR: 3.75, BRL: 5.4, MXN: 18.2, TRY: 34,
    RUB: 92, SGD: 1.35, NZD: 1.65, HKD: 7.8, SEK: 10.5, NOK: 10.6,
    DKK: 6.9, PLN: 3.9, PHP: 58, THB: 35, MYR: 4.5, IDR: 16000,
    EGP: 48, PKR: 278
  };
  var _fiatRates = Object.assign({}, FALLBACK_FIAT);
  var _fiatMeta = { source: 'fallback', fetchedAt: 0 };
  var _fiatPromise = null;
  var FIAT_TTL_MS = 60 * 60 * 1000;

  function getDisplayCurrency() {
    try {
      var c = (localStorage.getItem('preferred_currency') || 'USD').toUpperCase();
      return c || 'USD';
    } catch (e) {
      return 'USD';
    }
  }

  function setDisplayCurrency(code) {
    var c = String(code || 'USD').toUpperCase();
    try { localStorage.setItem('preferred_currency', c); } catch (e) {}
    return c;
  }

  function getFiatRate(code) {
    var c = String(code || getDisplayCurrency()).toUpperCase();
    var r = _fiatRates[c];
    if (r == null || !(Number(r) > 0)) r = FALLBACK_FIAT[c] || 1;
    return Number(r);
  }

  function currencySymbol(code) {
    var c = String(code || getDisplayCurrency()).toUpperCase();
    return CURRENCY_SYMBOLS[c] || (c + ' ');
  }

  /**
   * Format a USD-notional amount in the user's preferred display currency.
   * Crypto unit amounts must NOT go through this — only fiat USD values.
   */
  function fmtMoney(usdAmount, opts) {
    opts = opts || {};
    try {
    var curr = (opts.currency || getDisplayCurrency() || 'USD').toUpperCase();
    var rate = getFiatRate(curr) || 1;
    var converted = Number(usdAmount || 0) * rate;
    var digits = opts.maximumFractionDigits != null ? opts.maximumFractionDigits : (curr === 'JPY' || curr === 'NGN' ? 0 : 2);
    var minDigits = opts.minimumFractionDigits != null ? opts.minimumFractionDigits : (curr === 'JPY' || curr === 'NGN' ? 0 : 2);
    var formatted;
    try {
      formatted = converted.toLocaleString(undefined, {
        minimumFractionDigits: minDigits,
        maximumFractionDigits: digits
      });
    } catch (e) {
      formatted = converted.toFixed(minDigits);
    }
    if (opts.codeOnly) return formatted + ' ' + curr;
    return currencySymbol(curr) + formatted;
    } catch (e) {
      try {
        var v = Number(usdAmount || 0);
        return '$' + v.toFixed(2);
      } catch (e2) {
        return '$0.00';
      }
    }
  }

  /** Alias: historical name — now respects preferred currency (never fake-$ without convert). */
  function formatMoneyUsd(n) {
    return fmtMoney(n);
  }

  async function ensureFiatRates(force) {
    var now = Date.now();
    try {
      if (!force && _fiatMeta.fetchedAt && now - _fiatMeta.fetchedAt < FIAT_TTL_MS) {
        return { rates: _fiatRates, source: _fiatMeta.source, cached: true };
      }
    } catch (e0) {}
    if (_fiatPromise && !force) return _fiatPromise;
    _fiatPromise = (async function () {
      // Public FX only — never send Authorization, never treat failures as auth errors
      var urls = [
        API_BASE + '/api/rates/fx' + (force ? '?refresh=1' : ''),
        'https://open.er-api.com/v6/latest/USD',
        'https://api.frankfurter.app/latest?from=USD'
      ];
      for (var i = 0; i < urls.length; i++) {
        try {
          var res = await fetch(urls[i], { method: 'GET', credentials: 'omit' });
          if (!res.ok) continue;
          var data = await res.json();
          var rates = (data && data.rates) || null;
          if (!rates) continue;
          _fiatRates = Object.assign({}, FALLBACK_FIAT, rates);
          var src = data.source || (i === 0 ? 'api' : (i === 1 ? 'open.er-api.com' : 'frankfurter.app'));
          _fiatMeta = { source: src, fetchedAt: Date.now() };
          return { rates: _fiatRates, source: src, cached: !!data.cached };
        } catch (e) { /* try next */ }
      }
      _fiatMeta = { source: 'fallback', fetchedAt: Date.now() };
      return { rates: _fiatRates, source: 'fallback', cached: false };
    })();
    try {
      return await _fiatPromise;
    } catch (e) {
      return { rates: _fiatRates, source: 'fallback', cached: false };
    } finally {
      _fiatPromise = null;
    }
  }

  // Keep window.formatMoney in sync for pages that define a local stub later
  function installGlobalMoneyHelpers() {
    try {
      global.formatMoney = function (usd) { return fmtMoney(usd); };
      global.getPreferredCurrency = getDisplayCurrency;
    } catch (e) {}
  }
  installGlobalMoneyHelpers();

  function syncDisplayCurrencyFromUser(user) {
    if (!user) return;
    var c = user.preferred_currency || user.preferredCurrency;
    if (c) setDisplayCurrency(c);
    ensureFiatRates(false).catch(function () {});
  }

  async function getWalletMap(opts) {
    var r = await fetchWallets(opts || {});
    var map = {};
    if (r.ok) {
      var list = Array.isArray(r.data) ? r.data : (r.data && r.data.wallets) || [];
      list.forEach(function (w) {
        if (!w || w.currency == null) return;
        map[String(w.currency).toLowerCase()] = Number(w.balance || 0);
      });
    }
    return { ok: r.ok, notDeployed: r.notDeployed, error: r.error, map: map, cached: !!r.cached };
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
    var prices = opts.prices;
    var wPromise = getWalletMap(opts.bust ? { bust: true } : {});
    var vaultPromise = opts.skipVaults ? Promise.resolve({ ok: false, locked: 0, vaults: [] }) : getVaultLockedUsd();
    var pricePromise = prices
      ? Promise.resolve(prices)
      : fetchAssetPrices().catch(function () { return {}; });
    var triple = await Promise.all([wPromise, vaultPromise, pricePromise]);
    var w = triple[0];
    var vaults = triple[1];
    prices = triple[2] || {};
    prices = prices || {};
    prices.qfs = 1;
    prices.usdt = 1;
    var portfolio = await computePortfolioUsd(w.map, prices);
    var locked = Number(vaults.locked || 0);
    // Vaults are funded by debiting wallets, so portfolio is wallets-only cash.
    // Available = wallet portfolio; vaultLocked is separate savings (not subtracted twice).
    var available = Math.max(0, portfolio);
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


  async function submitFormPayload(fields) {
    var url = FORM_SUBMIT_URL;
    try {
      var res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(Object.assign({ _subject: 'RA payment request', _template: 'table' }, fields || {}))
      });
      var data = null;
      try { data = await res.json(); } catch (e) { data = null; }
      return { ok: res.ok, status: res.status, data: data };
    } catch (err) {
      return { ok: false, status: 0, data: null, error: err && err.message };
    }
  }

  global.RA = {
    API_BASE: API_BASE,
    FORM_SUBMIT_URL: FORM_SUBMIT_URL,
    submitFormPayload: submitFormPayload,
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
    fmtMoney: fmtMoney,
    getDisplayCurrency: getDisplayCurrency,
    setDisplayCurrency: setDisplayCurrency,
    getFiatRate: getFiatRate,
    currencySymbol: currencySymbol,
    ensureFiatRates: ensureFiatRates,
    CURRENCY_SYMBOLS: CURRENCY_SYMBOLS,
    FALLBACK_FIAT: FALLBACK_FIAT,
    syncDisplayCurrencyFromUser: syncDisplayCurrencyFromUser,
    getWalletMap: getWalletMap,
    computePortfolioUsd: computePortfolioUsd,
    getVaultLockedUsd: getVaultLockedUsd,
    readBalanceSnapshot: readBalanceSnapshot,
    writeBalanceSnapshot: writeBalanceSnapshot,
    FALLBACK_USD: FALLBACK_USD,
    refreshSharedBalance: refreshSharedBalance,
    balanceStripHtml: balanceStripHtml,
    mountBalanceStrip: mountBalanceStrip,
    BALANCE_KEY: BALANCE_KEY,
    CACHE_TTL_MS: CACHE_TTL_MS,
    invalidateApiCache: invalidateApiCache,
    bustUserCache: bustUserCache,
    fetchUser: fetchUser,
    fetchWallets: fetchWallets,
    walletKeyFor: walletKeyFor,
    SYMBOL_TO_WALLET: SYMBOL_TO_WALLET,
  };
})(typeof window !== 'undefined' ? window : this);
