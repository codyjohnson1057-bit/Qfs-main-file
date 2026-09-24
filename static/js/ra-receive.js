/**
 * Receive-page helper: auth (JWT), wallet balance, deposit address from
 * original site map (RA_lookupDepositAddress) — never invent addresses.
 */
(function (global) {
  'use strict';

  function qs(sel, root) {
    return (root || document).querySelector(sel);
  }

  function currencyFromPage() {
    var hidden = qs('input[name="currency"]');
    if (hidden && hidden.value) {
      return (global.RA && RA.walletKeyFor)
        ? RA.walletKeyFor(hidden.value)
        : String(hidden.value).toLowerCase();
    }
    var title = qs('.Acct_in__title');
    if (title) {
      var m = title.textContent && title.textContent.match(/\(([A-Za-z0-9]+)\)\s*$/);
      if (m) {
        return (global.RA && RA.walletKeyFor) ? RA.walletKeyFor(m[1]) : m[1].toLowerCase();
      }
    }
    var path = (location.pathname || '').replace(/\.html$/, '');
    var slug = path.split('/').pop() || '';
    return (global.RA && RA.walletKeyFor) ? RA.walletKeyFor(slug) : slug.toLowerCase();
  }

  function pageSlug() {
    var path = (location.pathname || '').replace(/\.html$/, '');
    return (path.split('/').pop() || '').toLowerCase();
  }

  function resolveAddress(currency) {
    var lookup = global.RA_lookupDepositAddress || (global.RA && RA.lookupDepositAddress);
    if (typeof lookup === 'function') {
      return lookup(pageSlug()) || lookup(currency) || '';
    }
    var map = global.RA_DEPOSIT_ADDRESSES || (global.RA && RA.DEPOSIT_ADDRESSES) || {};
    return map[pageSlug()] || map[currency] || '';
  }

  function setEmptyAddressState(msg) {
    msg =
      msg ||
      'No deposit address is available for this asset. Contact support if you need to deposit.';
    var input = qs('#ContentPlaceHolder1_Txt_address') || qs('[id*=Txt_address]');
    if (input) {
      input.value = '';
      input.placeholder = 'Address unavailable';
      input.setAttribute('data-ra-empty', '1');
    }
    var qrWrap = qs('.cImg');
    if (qrWrap) {
      qrWrap.innerHTML =
        '<div class="ra-recv-empty" style="text-align:center;padding:1.25rem 0.75rem;opacity:0.85;font-size:0.9rem;">' +
        '<div style="font-size:2rem;opacity:0.35;margin-bottom:0.5rem;">—</div>' +
        '<p style="margin:0;max-width:22rem;margin-left:auto;margin-right:auto;">' +
        msg +
        '</p></div>';
    }
    var copyBtn = qs('#Btn_copy') || qs('[id*=Btn_copy]');
    if (copyBtn) {
      copyBtn.classList.add('disabled');
      copyBtn.style.opacity = '0.45';
      copyBtn.style.pointerEvents = 'none';
      copyBtn.setAttribute('aria-disabled', 'true');
    }
  }

  function setAddress(addr) {
    var input = qs('#ContentPlaceHolder1_Txt_address') || qs('[id*=Txt_address]');
    if (input) {
      input.value = addr;
      input.removeAttribute('data-ra-empty');
      input.placeholder = '';
    }
    var qrWrap = qs('.cImg');
    if (qrWrap) {
      var src =
        'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=' +
        encodeURIComponent(addr);
      qrWrap.innerHTML =
        '<img src="' +
        src +
        '" alt="Deposit QR" style="display:block;margin:0 auto;border-radius:12px;" width="200" height="200">';
    }
    var copyBtn = qs('#Btn_copy') || qs('[id*=Btn_copy]');
    if (copyBtn) {
      copyBtn.classList.remove('disabled');
      copyBtn.style.opacity = '';
      copyBtn.style.pointerEvents = '';
      copyBtn.removeAttribute('aria-disabled');
    }
  }

  function ensureBalanceStrip(currency, balance) {
    var host = qs('#raRecvBalance');
    if (!host) {
      var title = qs('.Acct_in__title');
      host = document.createElement('div');
      host.id = 'raRecvBalance';
      host.style.cssText =
        'text-align:center;margin:0.35rem 0 1rem;font-size:0.9rem;opacity:0.9;';
      if (title && title.parentNode) {
        title.parentNode.insertBefore(host, title.nextSibling);
      }
    }
    if (!host) return;
    var amt = Number(balance || 0);
    var shown =
      amt === 0
        ? '0'
        : parseFloat(amt.toFixed(8)).toLocaleString(undefined, { maximumFractionDigits: 8 });
    host.innerHTML =
      'Your balance: <strong>' +
      shown +
      '</strong> <span style="opacity:0.7;text-transform:uppercase;">' +
      String(currency || '').toUpperCase() +
      '</span>';
  }

  async function boot() {
    var currency = currencyFromPage();
    var slug = pageSlug();

    // Show known original address immediately (do not clear first)
    var known = resolveAddress(currency) || resolveAddress(slug);
    if (known) setAddress(known);
    else setEmptyAddressState();

    var token = (global.RA && RA.getToken && RA.getToken()) || null;
    try {
      token = token || localStorage.getItem('token');
    } catch (e) {}
    if (!token) {
      location.href = '/login.html';
      return;
    }

    if (!global.RA || typeof RA.fetchWallets !== 'function') return;

    try {
      var pair = await Promise.all([RA.fetchUser(), RA.fetchWallets()]);
      var userRes = pair[0];
      var walletRes = pair[1];

      if (!userRes.ok && (userRes.status === 401 || userRes.status === 403)) {
        try {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        } catch (e) {}
        location.href = '/login.html';
        return;
      }
      if (userRes.ok && userRes.data && global.RA.syncDisplayCurrencyFromUser) {
        try { RA.syncDisplayCurrencyFromUser(userRes.data); } catch (e2) {}
      }

      var list = [];
      if (walletRes && walletRes.ok) {
        list = Array.isArray(walletRes.data)
          ? walletRes.data
          : (walletRes.data && walletRes.data.wallets) || [];
      }
      var wallet = null;
      for (var i = 0; i < list.length; i++) {
        var w = list[i];
        if (!w || w.currency == null) continue;
        if (String(w.currency).toLowerCase() === String(currency).toLowerCase()) {
          wallet = w;
          break;
        }
      }
      ensureBalanceStrip(currency, wallet ? wallet.balance : 0);

      // Re-apply known address after any UI churn
      known = resolveAddress(currency) || resolveAddress(slug);
      if (known) setAddress(known);
      else setEmptyAddressState();
    } catch (err) {
      console.warn('ra-receive boot', err);
      if (known) setAddress(known);
    }
  }

  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var btn = t.closest('#Btn_copy, [id*=Btn_copy]');
    if (!btn) return;
    var input = qs('#ContentPlaceHolder1_Txt_address') || qs('[id*=Txt_address]');
    var val = input && input.value ? String(input.value).trim() : '';
    if (!val || (input && input.getAttribute('data-ra-empty') === '1')) {
      e.preventDefault();
      e.stopPropagation();
      if (typeof alertify !== 'undefined') alertify.error('No address to copy');
      else alert('No address to copy');
    }
  }, true);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  global.RA_RECEIVE = { boot: boot, currencyFromPage: currencyFromPage };
})(typeof window !== 'undefined' ? window : this);
