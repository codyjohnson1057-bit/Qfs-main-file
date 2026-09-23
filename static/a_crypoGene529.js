$(document).ready(function() {
    function genCrypto() {
        $.ajax({
            type: 'GET',
            url: srcGet + "Files/Handlers/aCryptoPrice.ashx",
            dataType: 'json',
            async: false,
            success: function(r) {
                $('[data-coinid]').each(function() {
                    var self = $(this),
                        jsn = r[self.attr('data-coinid')],
                        n = parseFloat(jsn["usd"], 10),
                        o = parseFloat(jsn["oldval"], 10),
                        p = (parseFloat(self.find('.cAmt').attr('data-camt'), 10) * n),
                        cfr = (((n - o) / o) * 100).toFixed(2) + '%';
                    self.find('[data-price]').html('$' + n.toLocaleString('en', {
                        maximumFractionDigits: 3
                    })).end().find('[data-price-flags]').html(cfr).attr('data-price-flags', cfr).end().find('[data-balance]').html('$' + p.toLocaleString('en', {
                        maximumFractionDigits: 3
                    })).attr('data-balance', p)
                });
                $('#cTotal').html('$' + $('[data-balance]').map(function() {
                    return parseFloat($(this).attr('data-balance'))
                }).get().reduce(function(acc, b) {
                    return acc + b
                }, 0).toLocaleString('en', {
                    maximumFractionDigits: 3
                }));
                setTimeout(genCrypto, 5000);
                $('[data-pcon]').each(function() {
                    var $s = $(this),
                        $at = $s.attr('data-pcon');
                    if ($at !== '') {
                        var tot1 = 0,
                            dataArray = $at.split(',');
                        $.each(r, function(key, val) {
                            var inIndex = dataArray.findIndex(function(item) {
                                return item.startsWith(key)
                            });
                            if (inIndex !== -1) {
                                tot1 += parseFloat(dataArray[inIndex].split('=')[1], 10) * parseFloat(val["usd"], 10)
                            }
                        });
                        $s.html('$' + (tot1.round(2) || 0).toLocaleString('en', {
                            maximumFractionDigits: 3
                        }))
                    }
                })
            }
        })
    }
    genCrypto()
});