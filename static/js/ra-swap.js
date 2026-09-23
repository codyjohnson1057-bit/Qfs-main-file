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

  window._raWallets = {};
  window._raPrices = {};

  function buildOptions(selectEl, selectedKey) {
    if (!selectEl || !window.RA || !RA.DASHBOARD_ASSETS) return;
    var html = '';
    RA.DASHBOARD_ASSETS.forEach(function (a) {
      var bal = Number(window._raWallets[a.key] || 0);
      var price = Number(window._raPrices[a.key] || 0);
      var sel = a.key === selectedKey ? ' selected' : '';
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
        var key = String(opt.value || '').toLowerCase();
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
    var toPrice = parseFloat(toSelect.options[toSelect.selectedIndex].getAttribute('data-value')) || 0;
    var recv = toPrice > 0 ? usd / toPrice : 0;
    out.textContent = recv ? recv.toFixed(8) : '0';
  };

  async function loadSwapData() {
    if (!RA.getToken()) {
      window.location.href = 'login.html';
      return;
    }
    var fromSel = document.getElementById('coin-from');
    var toSel = document.getElementById('coin-to');
    var keepFrom = fromSel ? fromSel.value : 'btc';
    var keepTo = toSel ? toSel.value : 'eth';
    if (keepFrom && keepFrom.indexOf('_wallet') >= 0) keepFrom = 'btc';
    if (keepTo && keepTo.indexOf('_wallet') >= 0) keepTo = 'eth';

    var w = await RA.api('/api/wallets');
    window._raWallets = {};
    if (w.ok) {
      var list = Array.isArray(w.data) ? w.data : (w.data && w.data.wallets) || [];
      list.forEach(function (row) {
        var k = String(row.currency || row.asset || '').toLowerCase();
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

    var tbody = document.querySelector('table.tbxx tbody');
    if (tbody) {
      var tx = await RA.api('/api/transactions');
      if (tx.ok) {
        var rows = Array.isArray(tx.data) ? tx.data : (tx.data && tx.data.transactions) || [];
        var swaps = rows.filter(function (t) {
          return String(t.type || t.kind || '').toLowerCase().indexOf('swap') >= 0;
        });
        if (!swaps.length) {
          tbody.innerHTML =
            '<tr><td colspan="999" style="text-align:center;opacity:0.7;padding:1rem;">History syncs from portal</td></tr>';
        } else {
          tbody.innerHTML = swaps
            .map(function (t) {
              return (
                '<tr><td>' + (t.id || '—') + '</td><td>' + (t.details || t.type || 'Swap') +
                '</td><td>' + (t.amount != null ? t.amount : '') + '</td><td>' +
                (t.created_at || t.date || '') + '</td></tr>'
              );
            })
            .join('');
        }
      } else {
        tbody.innerHTML =
          '<tr><td colspan="999" style="text-align:center;opacity:0.7;padding:1rem;">History syncs from portal</td></tr>';
      }
    }
  }

  function bindForm() {
    var form = document.getElementById('mainSwapForm');
    if (!form || form._raBound) return;
    form._raBound = 1;
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      var btn = document.getElementById('submitBtn');
      var pinEl = document.getElementById('swap_pin');
      var amtEl = document.getElementById('swap_amount');
      var fromSelect = document.getElementById('coin-from');
      var toSelect = document.getElementById('coin-to');
      var pin = pinEl ? pinEl.value : '';
      var usdAmount = parseFloat(amtEl && amtEl.value);
      var fromKey = fromSelect.value;
      var toKey = toSelect.value;
      if (!usdAmount || usdAmount <= 0) return notify('error', 'Enter a valid amount');
      if (fromKey === toKey) return notify('error', 'Choose different assets');
      btn.disabled = true;
      btn.innerText = 'Processing...';
      try {
        var r = await RA.api('/api/swap', {
          method: 'POST',
          body: { from: fromKey, to: toKey, amount: usdAmount, pin: pin || undefined },
        });
        if (r.notDeployed) {
          notify('error', 'Swap API unavailable — balances were not changed.');
          return;
        }
        if (!r.ok) {
          notify('error', r.error || 'Swap failed');
          return;
        }
        notify('success', 'Swap successful');
        if (r.data && Array.isArray(r.data.wallets)) {
          var map = {};
          r.data.wallets.forEach(function (row) {
            map[String(row.currency || '').toLowerCase()] = Number(row.balance || 0);
          });
          window._raWallets = map;
          refreshOptionMeta();
          updateUI();
        } else {
          await loadSwapData();
        }
        form.reset();
        updateUI();
      } catch (err) {
        notify('error', 'Swap failed: ' + (err && err.message ? err.message : err));
      } finally {
        btn.disabled = false;
        btn.innerText = 'Confirm Swap';
      }
    });
  }

  function init() {
    if (!window.RA) {
      console.error('RA api helper missing');
      return;
    }
    bindForm();
    loadSwapData();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
