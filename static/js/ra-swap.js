/**
 * Swap page — wallet swap helper.
 * Expects RA from /static/js/ra-api.js
 */
(function () {
  'use strict';

  function notify(status, message) {
    if (typeof iziToast !== 'undefined' && iziToast[status]) {
      iziToast[status]({ title: String(status).toUpperCase(), message: message, position: 'topRight' });
    } else {
      alert(message);
    }
  }

  function stripWalletSuffix(key) {
    var k = String(key || '').trim().toLowerCase();
    if (k.endsWith('_wallet')) k = k.slice(0, -7);
    if (k === 'usdt_trc' || k === 'usdt-trc20' || k === 'usdt_trc20') k = 'usdt';
    return k;
  }

  window._raWallets = {};
  window._raPrices = {};

  function buildOptions(selectEl, selectedKey) {
    if (!selectEl || !window.RA || !RA.DASHBOARD_ASSETS) return;
    var html = '';
    var want = stripWalletSuffix(selectedKey);
    RA.DASHBOARD_ASSETS.forEach(function (a) {
      var bal = Number(window._raWallets[a.key] || 0);
      var price = Number(window._raPrices[a.key] || 0);
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
        var price = Number(window._raPrices[key] || 0);
        opt.setAttribute('data-balance', String(bal));
        opt.setAttribute('data-value', String(price));
        var asset = (RA.DASHBOARD_ASSETS || []).find(function (a) { return a.key === key; });
        var label = asset ? asset.label : String(opt.textContent || '').split(' · ')[0];
        opt.textContent = label + ' · ' + bal;
      });
    });
  }

  window.updateUI = function updateUI() {
    var fromSelect = document.getElementById('coin-from');
    var toSelect = document.getElementById('coin-to');
    if (!fromSelect || !toSelect) return;
    var fromOpt = fromSelect.options[fromSelect.selectedIndex];
    var toOpt = toSelect.options[toSelect.selectedIndex];
    var fromImg = document.getElementById('from_logo_img');
    var toImg = document.getElementById('to_logo_img');
    if (fromImg && fromOpt) fromImg.src = fromOpt.getAttribute('data-src') || fromImg.src;
    if (toImg && toOpt) toImg.src = toOpt.getAttribute('data-src') || toImg.src;
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
    var amtEl = document.getElementById('swap_amount');
    var out = document.getElementById('swap_receive_val');
    if (!toSelect || !amtEl || !out) return;
    var usd = parseFloat(amtEl.value) || 0;
    var toOpt = toSelect.options[toSelect.selectedIndex];
    var toPrice = toOpt ? parseFloat(toOpt.getAttribute('data-value')) || 0 : 0;
    var recv = toPrice > 0 ? usd / toPrice : 0;
    out.textContent = recv ? recv.toFixed(8) : '0';
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
      var amt = t.amount_usd != null ? ('$' + Number(t.amount_usd).toFixed(2))
        : (t.amount != null ? String(t.amount) : '');
      var st = t.status || 'completed';
      return '<tr><td>' + (t.id || '—') + '</td><td>' + desc +
        '</td><td>' + amt + ' · ' + st + '</td><td>' + when + '</td></tr>';
    }).join('');
  }

  async function loadSwapData() {
    if (!window.RA || !RA.getToken || !RA.getToken()) {
      window.location.href = 'login.html';
      return;
    }
    var fromSel = document.getElementById('coin-from');
    var toSel = document.getElementById('coin-to');
    var keepFrom = fromSel ? stripWalletSuffix(fromSel.value) : 'btc';
    var keepTo = toSel ? stripWalletSuffix(toSel.value) : 'eth';
    if (!keepFrom || keepFrom === 'qfs') keepFrom = keepFrom || 'btc';
    if (!keepTo) keepTo = 'eth';

    var w = await RA.api('/api/wallets');
    window._raWallets = {};
    if (w.ok) {
      var list = Array.isArray(w.data) ? w.data : (w.data && w.data.wallets) || [];
      list.forEach(function (row) {
        var k = stripWalletSuffix(row.currency || row.asset || '');
        window._raWallets[k] = Number(row.balance || 0);
      });
    }

    try {
      window._raPrices = await RA.fetchAssetPrices();
    } catch (e) {
      window._raPrices = {};
    }

    buildOptions(fromSel, keepFrom || 'btc');
    buildOptions(toSel, keepTo || 'eth');
    if (fromSel && toSel && fromSel.value === toSel.value && toSel.options.length > 1) {
      toSel.selectedIndex = fromSel.selectedIndex === 0 ? 1 : 0;
    }
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
    if (!form) {
      console.warn('mainSwapForm missing');
      return;
    }
    if (form._raBound) return;
    form._raBound = 1;
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      e.stopPropagation();
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
      if (!usdAmount || usdAmount <= 0 || isNaN(usdAmount)) return notify('error', 'Enter a valid USD amount');
      if (!fromKey || !toKey) return notify('error', 'Choose from and to assets');
      if (fromKey === toKey) return notify('error', 'Choose different assets');
      if (btn) {
        btn.disabled = true;
        btn.innerText = 'Processing...';
      }
      try {
        if (!window.RA || !RA.api) {
          notify('error', 'API helper missing — refresh the page.');
          return;
        }
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
            map[stripWalletSuffix(row.currency || '')] = Number(row.balance || 0);
          });
          window._raWallets = map;
          refreshOptionMeta();
          updateUI();
        } else {
          await loadSwapData();
        }
        if (window.RA && RA.refreshSharedBalance) {
          try { await RA.refreshSharedBalance({ force: true }); } catch (e) {}
        }
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
        if (btn) {
          btn.disabled = false;
          btn.innerText = 'Confirm Swap';
        }
      }
    });
  }

  function init() {
    if (!window.RA) {
      console.error('RA api helper missing — retrying…');
      setTimeout(init, 200);
      return;
    }
    bindForm();
    loadSwapData();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
