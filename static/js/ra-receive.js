/**
 * Receive-page helper: auth, wallet balance from /api/wallets, deposit address
 * only when API provides one (never invent blockchain addresses).
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

  function extractAddress(walletObj) {
    if (!walletObj || typeof walletObj !== 'object') return '';
    var keys = [
      'address',
      'deposit_address',
      'receive_address',
      'wallet_address',
      'public_address'
    ];
    for (var i = 0; i < keys.length; i++) {
      var v = walletObj[keys[i]];
      if (v != null && String(v).trim()) return String(v).trim();
    }
    return '';
  }

  function setEmptyAddressState(msg) {
    msg =
      msg ||
      'No deposit address is available for this asset yet. Contact support if you need to deposit.';
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
        '" alt="Deposit QR" style="display:block;margin:0 auto;" width="200" height="200">';
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
      } else {
        var cap = qs('#appCapsule') || document.body;
        cap.insertBefore(host, cap.firstChild);
      }
    }
    var amt = Number(balance || 0);
    var fmt =
      global.RA && typeof RA.formatMoneyUsd === 'function'
        ? null
        : null;
    var shown =
      amt === 0
        ? '0'
        : parseFloat(amt.toFixed(8)).toLocaleString(undefined, {
            maximumFractionDigits: 8
          });
    host.innerHTML =
      'Your balance: <strong>' +
      shown +
      '</strong> <span style="opacity:0.7;text-transform:uppercase;">' +
      String(currency || '').toUpperCase() +
      '</span>';
  }

  function ensureErrorBox(msg) {
    var box = qs('#raRecvError');
    if (!box) {
      box = document.createElement('div');
      box.id = 'raRecvError';
      box.style.cssText =
        'margin:0.75rem auto 1rem;max-width:28rem;padding:0.75rem 1rem;border-radius:10px;border:1px dashed rgba(239,68,68,0.45);color:#fca5a5;font-size:0.85rem;text-align:center;';
      var card = qs('#ContentPlaceHolder1_Send_Part2') || qs('#appCapsule');
      if (card) card.insertBefore(box, card.firstChild);
    }
    box.textContent = msg || 'Unable to load wallet details.';
    box.style.display = msg ? 'block' : 'none';
  }

  async function boot() {
    if (!global.RA || typeof RA.api !== 'function') {
      setEmptyAddressState('API helper unavailable. Please refresh.');
      return;
    }
    var token = RA.getToken && RA.getToken();
    if (!token) {
      location.href = '/login.html';
      return;
    }

    // Clear any hardcoded demo address immediately (do not show invented addresses)
    setEmptyAddressState('Loading deposit details…');

    var currency = currencyFromPage();
    try {
      var pair = await Promise.all([
        RA.fetchUser(),
        RA.fetchWallets()
      ]);
      var userRes = pair[0];
      var walletRes = pair[1];

      if (!userRes.ok) {
        if (userRes.status === 401 || userRes.status === 403) {
          try {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          } catch (e) {}
          location.href = '/login.html';
          return;
        }
        ensureErrorBox(userRes.error || 'Session check failed');
      } else if (userRes.data) {
        var u = userRes.data;
        if (u.preferred_currency) {
          try {
            localStorage.setItem('preferred_currency', u.preferred_currency);
          } catch (e2) {}
        }
        try {
          localStorage.setItem(
            'user',
            JSON.stringify({
              id: u.id,
              fullName: u.full_name || u.fullName,
              email: u.email,
              role: u.role
            })
          );
        } catch (e3) {}
      }

      if (!walletRes.ok) {
        ensureErrorBox(walletRes.error || 'Could not load wallets');
        setEmptyAddressState(
          walletRes.notDeployed
            ? 'Wallet API unavailable. Deposit addresses will appear once the service is online.'
            : 'Could not load wallet. Please try again.'
        );
        return;
      }

      ensureErrorBox('');
      var list = Array.isArray(walletRes.data)
        ? walletRes.data
        : (walletRes.data && walletRes.data.wallets) || [];
      var wallet = null;
      for (var i = 0; i < list.length; i++) {
        var w = list[i];
        if (!w || w.currency == null) continue;
        if (String(w.currency).toLowerCase() === currency) {
          wallet = w;
          break;
        }
      }
      var bal = wallet ? Number(wallet.balance || 0) : 0;
      ensureBalanceStrip(currency, bal);

      // Prefer address on wallet row; also accept top-level addresses map if API adds it later
      var addr = extractAddress(wallet);
      if (!addr && walletRes.data && walletRes.data.addresses) {
        addr = walletRes.data.addresses[currency] || '';
      }
      if (addr) {
        setAddress(String(addr));
      } else {
        setEmptyAddressState();
      }

      // Soft-refresh shared portfolio snapshot without blocking UI
      if (typeof RA.refreshSharedBalance === 'function') {
        RA.refreshSharedBalance({ skipVaults: false }).catch(function () {});
      }
    } catch (err) {
      console.error('ra-receive boot', err);
      ensureErrorBox(err && err.message ? err.message : 'Failed to load receive page');
      setEmptyAddressState();
    }
  }

  // Safer copy: only when a real address is present
  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t) return;
    var btn = t.closest ? t.closest('#Btn_copy, [id*=Btn_copy]') : null;
    if (!btn) return;
    var input = qs('#ContentPlaceHolder1_Txt_address') || qs('[id*=Txt_address]');
    var val = input && input.value ? String(input.value).trim() : '';
    if (!val || (input && input.getAttribute('data-ra-empty') === '1')) {
      e.preventDefault();
      e.stopPropagation();
      if (typeof alertify !== 'undefined') alertify.error('No address to copy');
      else alert('No address to copy');
      return false;
    }
  }, true);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  global.RA_RECEIVE = { boot: boot, currencyFromPage: currencyFromPage };
})(typeof window !== 'undefined' ? window : this);
