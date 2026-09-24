/**
 * Swap page — robust wallet swap with icons, balance checks, display-currency preview.
 */
(function () {
  'use strict';

  var _submitting = false;
  var PLACEHOLDER_ICON =
    'data:image/svg+xml,' +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><circle cx="20" cy="20" r="18" fill="#334155"/><text x="20" y="24" text-anchor="middle" fill="#94a3b8" font-size="12">?</text></svg>'
    );

  function notify(status, message) {
    if (typeof iziToast !== 'undefined' && iziToast[status]) {
      iziToast[status]({ title: String(status).toUpperCase(), message: message, position: 'topRight' });
    } else if (typeof Swal !== 'undefined') {
      Swal.fire({ icon: status === 'success' ? 'success' : 'error', title: message, timer: 2200, showConfirmButton: false });
    } else {
      alert(message);
    }
  }

  function stripWalletSuffix(key) {
    var k = String(key || '').trim().toLowerCase();
    if (k.endsWith('_wallet')) k = k.slice(0, -7);
    if (k === 'usdt_trc' || k === 'usdt-trc20' || k === 'usdt_trc20' || k === 'usdtrc') k = 'usdt';
    if (k === 'trx') k = 'tron';
    return k;
  }

  function priceFor(key) {
    key = stripWalletSuffix(key);
    var p = Number(window._raPrices && window._raPrices[key]);
    if (p > 0) return p;
    var fb = (window.RA && RA.FALLBACK_USD) || {};
    if (key === 'qfs') return 1;
    return Number(fb[key] || 0);
  }

  function moneyUsd(n) {
    if (window.RA && typeof RA.fmtMoney === 'function') return RA.fmtMoney(n);
    return '$' + Number(n || 0).toFixed(2);
  }

  function setImg(el, src) {
    if (!el) return;
    el.onerror = function () {
      this.onerror = null;
      this.src = PLACEHOLDER_ICON;
    };
    el.src = src || PLACEHOLDER_ICON;
    el.style.borderRadius = '50%';
    el.style.objectFit = 'cover';
  }

  window._raWallets = {};
  window._raPrices = {};

  function buildOptions(selectEl, selectedKey) {
    if (!selectEl || !window.RA || !RA.DASHBOARD_ASSETS) return;
    var html = '';
    var want = stripWalletSuffix(selectedKey);
    RA.DASHBOARD_ASSETS.forEach(function (a) {
      var bal = Number(window._raWallets[a.key] || 0);
      var price = priceFor(a.key);
      var sel = a.key === want ? ' selected' : '';
      html +=
        '<option value="' + a.key +
        '" data-symbol="' + a.symbol +
        '" data-value="' + price +
        '" data-balance="' + bal +
        '" data-src="' + (a.icon || '') + '"' + sel + '>' +
        a.label + ' · ' + bal + '</option>';
    });
    selectEl.innerHTML = html;
  }

  function refreshOptionMeta() {
    ['coin-from', 'coin-to'].forEach(function (id) {
      var sel = document.getElementById(id);
      if (!sel) return;
      Array.prototype.forEach.call(sel.options, function (opt) {
        var key = stripWalletSuffix(opt.value);
        opt.value = key;
        var bal = Number(window._raWallets[key] || 0);
        var price = priceFor(key);
        opt.setAttribute('data-balance', String(bal));
        opt.setAttribute('data-value', String(price));
        var asset = (RA.DASHBOARD_ASSETS || []).find(function (a) { return a.key === key; });
        if (asset && asset.icon) opt.setAttribute('data-src', asset.icon);
        var label = asset ? asset.label : String(opt.textContent || '').split(' · ')[0];
        opt.textContent = label + ' · ' + bal;
      });
    });
  }

  function ensureMaxButton() {
    var amt = document.getElementById('swap_amount');
    if (!amt || document.getElementById('raSwapMaxBtn')) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'raSwapMaxBtn';
    btn.className = 'btn btn-sm btn-outline-secondary';
    btn.textContent = 'Max';
    btn.style.marginLeft = '8px';
    btn.addEventListener('click', function () {
      var fromSelect = document.getElementById('coin-from');
      if (!fromSelect) return;
      var fromKey = stripWalletSuffix(fromSelect.value);
      var bal = Number(window._raWallets[fromKey] || 0);
      var px = priceFor(fromKey);
      var usd = px > 0 ? bal * px : 0;
      amt.value = usd > 0 ? String(Number(usd.toFixed(8))) : '0';
      window.calculateSwap();
    });
    var parent = amt.parentNode;
    if (parent) parent.appendChild(btn);
  }

  function ensurePreviewLine() {
    var out = document.getElementById('swap_receive_val');
    if (!out) return;
    var line = document.getElementById('raSwapPreviewFiat');
    if (!line) {
      line = document.createElement('div');
      line.id = 'raSwapPreviewFiat';
      line.style.cssText = 'font-size:0.85rem;opacity:0.8;margin-top:0.35rem;';
      if (out.parentNode) out.parentNode.appendChild(line);
    }
  }

  window.updateUI = function updateUI() {
    var fromSelect = document.getElementById('coin-from');
    var toSelect = document.getElementById('coin-to');
    if (!fromSelect || !toSelect) return;
    var fromOpt = fromSelect.options[fromSelect.selectedIndex];
    var toOpt = toSelect.options[toSelect.selectedIndex];
    setImg(document.getElementById('from_logo_img'), fromOpt && fromOpt.getAttribute('data-src'));
    setImg(document.getElementById('to_logo_img'), toOpt && toOpt.getAttribute('data-src'));
    var recv = document.getElementById('receive_sym');
    if (recv && toOpt) recv.textContent = toOpt.getAttribute('data-symbol') || '';
    var balEl = document.getElementById('assetBal');
    var symEl = document.getElementById('assetSym');
    if (balEl && fromOpt) balEl.textContent = fromOpt.getAttribute('data-balance') || '0';
    if (symEl && fromOpt) symEl.textContent = fromOpt.getAttribute('data-symbol') || '';
    window.calculateSwap();
  };

  window.calculateSwap = function calculateSwap() {
    var toSelect = document.getElementById('coin-to');
    var fromSelect = document.getElementById('coin-from');
    var amtEl = document.getElementById('swap_amount');
    var out = document.getElementById('swap_receive_val');
    if (!toSelect || !amtEl || !out) return;
    var usd = parseFloat(amtEl.value) || 0;
    var toOpt = toSelect.options[toSelect.selectedIndex];
    var toPrice = toOpt ? parseFloat(toOpt.getAttribute('data-value')) || priceFor(toOpt.value) : 0;
    var recv = toPrice > 0 ? usd / toPrice : 0;
    out.textContent = recv ? recv.toFixed(8) : '0';
    ensurePreviewLine();
    var line = document.getElementById('raSwapPreviewFiat');
    if (line) {
      var fromKey = fromSelect ? stripWalletSuffix(fromSelect.value) : '';
      var bal = Number(window._raWallets[fromKey] || 0);
      var fromPx = priceFor(fromKey);
      var maxUsd = fromPx > 0 ? bal * fromPx : 0;
      line.textContent =
        'Notional ' + moneyUsd(usd) +
        (maxUsd > 0 ? ' · Available ≈ ' + moneyUsd(maxUsd) : '');
    }
  };

  function renderSwapHistory(rows) {
    var tbody = document.querySelector('table.tbxx tbody');
    if (!tbody) return;
    var swaps = (rows || []).filter(function (t) {
      return String(t.type || t.kind || '').toLowerCase().indexOf('swap') >= 0;
    });
    if (!swaps.length) {
      tbody.innerHTML =
        '<tr><td colspan="999" style="text-align:center;opacity:0.7;padding:1rem;">No swaps yet</td></tr>';
      return;
    }
    tbody.innerHTML = swaps.slice(0, 50).map(function (t) {
      var when = t.created_at || t.date || '';
      try { when = new Date(when).toLocaleString(); } catch (e) {}
      var desc = t.description || t.details || t.type || 'Swap';
      var amt =
        t.amount_usd != null
          ? moneyUsd(t.amount_usd)
          : (t.amount != null ? String(t.amount) : '');
      var st = t.status || 'completed';
      return (
        '<tr><td>' + (t.id || '—') + '</td><td>' + desc +
        '</td><td>' + amt + ' · ' + st + '</td><td>' + when + '</td></tr>'
      );
    }).join('');
  }

  async function loadSwapData() {
    if (!window.RA || !RA.getToken || !RA.getToken()) {
      window.location.href = '/login.html';
      return;
    }
    try {
      if (RA.ensureFiatRates) await RA.ensureFiatRates().catch(function () {});
    } catch (e) {}

    var fromSel = document.getElementById('coin-from');
    var toSel = document.getElementById('coin-to');
    var keepFrom = fromSel ? stripWalletSuffix(fromSel.value) : 'usdt';
    var keepTo = toSel ? stripWalletSuffix(toSel.value) : 'btc';

    var w = await RA.fetchWallets({ bust: true }).catch(function () { return { ok: false }; });
    if (!w.ok && RA.api) w = await RA.api('/api/wallets');
    window._raWallets = {};
    if (w && w.ok) {
      var list = Array.isArray(w.data) ? w.data : (w.data && w.data.wallets) || [];
      list.forEach(function (row) {
        var k = stripWalletSuffix(row.currency || row.asset || '');
        // map wallet keys through walletKeyFor
        if (RA.walletKeyFor) k = RA.walletKeyFor(k) || k;
        window._raWallets[k] = Number(row.balance || 0);
      });
    }

    try {
      window._raPrices = await RA.fetchAssetPrices();
    } catch (e) {
      window._raPrices = Object.assign({}, (RA.FALLBACK_USD || {}));
    }
    // Ensure QFS = $1
    window._raPrices.qfs = 1;

    buildOptions(fromSel, keepFrom || 'usdt');
    buildOptions(toSel, keepTo || 'btc');
    if (fromSel && toSel && fromSel.value === toSel.value && toSel.options.length > 1) {
      toSel.selectedIndex = fromSel.selectedIndex === 0 ? 1 : 0;
    }
    ensureMaxButton();
    updateUI();

    var tx = await RA.api('/api/transactions');
    if (tx.ok) {
      var rows = Array.isArray(tx.data) ? tx.data : (tx.data && tx.data.transactions) || [];
      renderSwapHistory(rows);
    } else {
      renderSwapHistory([]);
    }
  }

  function bindForm() {
    var form = document.getElementById('mainSwapForm');
    if (!form || form._raBound) return;
    form._raBound = 1;
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (_submitting) return;
      var btn = document.getElementById('submitBtn');
      var pinEl = document.getElementById('swap_pin');
      var amtEl = document.getElementById('swap_amount');
      var fromSelect = document.getElementById('coin-from');
      var toSelect = document.getElementById('coin-to');
      if (!fromSelect || !toSelect || !amtEl) {
        notify('error', 'Swap form is incomplete — refresh the page.');
        return;
      }
      var pin = pinEl ? String(pinEl.value || '').trim() : '';
      var usdAmount = parseFloat(amtEl.value);
      var fromKey = stripWalletSuffix(fromSelect.value);
      var toKey = stripWalletSuffix(toSelect.value);
      if (!pin) return notify('error', 'Enter your transaction PIN');
      if (!usdAmount || usdAmount <= 0 || isNaN(usdAmount)) return notify('error', 'Enter a valid positive USD amount');
      if (!fromKey || !toKey) return notify('error', 'Choose from and to assets');
      if (fromKey === toKey) return notify('error', 'Choose different assets');

      var bal = Number(window._raWallets[fromKey] || 0);
      var fromPx = priceFor(fromKey);
      var needUnits = fromPx > 0 ? usdAmount / fromPx : Infinity;
      if (!(fromPx > 0)) return notify('error', 'No price for ' + fromKey.toUpperCase());
      if (needUnits > bal + 1e-12) {
        return notify(
          'error',
          'Insufficient ' + fromKey.toUpperCase() + ' balance (need ≈ ' +
            needUnits.toFixed(8) + ', have ' + bal + ')'
        );
      }

      _submitting = true;
      if (btn) {
        btn.disabled = true;
        btn.innerText = 'Processing...';
      }
      try {
        var r = await RA.api('/api/swap', {
          method: 'POST',
          body: { from: fromKey, to: toKey, amount: usdAmount, pin: pin }
        });
        if (r.notDeployed) {
          notify('error', 'Swap API unavailable — balances were not changed.');
          return;
        }
        if (!r.ok) {
          notify('error', r.error || ('Swap failed (HTTP ' + r.status + ')'));
          return;
        }
        notify('success', 'Swap successful');
        if (r.data && Array.isArray(r.data.wallets)) {
          var map = {};
          r.data.wallets.forEach(function (row) {
            var k = stripWalletSuffix(row.currency || '');
            if (RA.walletKeyFor) k = RA.walletKeyFor(k) || k;
            map[k] = Number(row.balance || 0);
          });
          window._raWallets = map;
          refreshOptionMeta();
          updateUI();
        } else {
          await loadSwapData();
        }
        if (RA.refreshSharedBalance) {
          try { await RA.refreshSharedBalance({ force: true }); } catch (e) {}
        }
        if (RA.invalidateApiCache) RA.invalidateApiCache();
        if (pinEl) pinEl.value = '';
        if (amtEl) amtEl.value = '';
        updateUI();
        var tx = await RA.api('/api/transactions');
        if (tx.ok) {
          var rows = Array.isArray(tx.data) ? tx.data : (tx.data && tx.data.transactions) || [];
          renderSwapHistory(rows);
        }
      } catch (err) {
        notify('error', 'Swap failed: ' + (err && err.message ? err.message : err));
      } finally {
        _submitting = false;
        if (btn) {
          btn.disabled = false;
          btn.innerText = 'Confirm Swap';
        }
      }
    });
  }

  function init() {
    if (!window.RA) {
      setTimeout(init, 200);
      return;
    }
    bindForm();
    ensureMaxButton();
    loadSwapData();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
