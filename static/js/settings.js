$(document).ready(function() {
    $('body').on('change', '#two-step', function(e) {
        e.preventDefault();
        $(this).parent().parent().trigger('submit');
    })

    $('body').on('submit', '.profile-form', function(e) {
        e.preventDefault();
        let modal = $(this).data('modal');
        if (modal) {
            $('#' + modal).modal('hide');
        }
        let button = $(e.target).find('.profile-btn');
        let buttonText = button.html();
        let formData = $(this).serialize()
        let type = $(this).data('type');
        let btnWidth = button.outerWidth();
        Swal.fire({
            html: "<h2>Enter your password to continue</h2>",
            input: "password",
            inputAttributes: {
                autocapitalize: "off"
            },
            showCancelButton: true,
            confirmButtonText: "Confrm",
            showLoaderOnConfirm: true,
            preConfirm: async (password) => {
                try {
                    if (modal) {
                        $('#' + modal).modal('show');
                    }
                    $.ajax({
                        url: "settings/xhrUpdate",
                        method: "POST",
                        data: formData + '&password=' + password + '&type=' + type,
                        beforeSend: function() {
                            button.html('<i class="spinner-border-sm spinner-border"></i>');
                            button.attr('disabled', true);
                            button.css('width', (btnWidth + 0.5) + 'px');
                        },
                        success: function(data) {
                            if (data == 'success') {
                                toastr.success('Your ' + type + ' has been updated succesfully!', "", {
                                    positionClass: "toast-top-right",
                                    "onclick": null,
                                    showEasing: "swing",
                                    timeOut: "5000"
                                });
                                setTimeout(function() {
                                    window.location.reload();
                                }, 1000)
                            } else {
                                toastr.error(data, "", {
                                    positionClass: "toast-top-right",
                                    "onclick": null,
                                    showEasing: "swing",
                                    timeOut: "5000"
                                })
                                button.html(buttonText);
                                button.attr('disabled', false);
                            }
                        }
                    })
                } catch (error) {
                    Swal.showValidationMessage(`
                Request failed: ${error}
              `);
                }
            },
            allowOutsideClick: () => !Swal.isLoading()
        }).then((result) => {
            // if (result.isConfirmed) {

            // }
        });

    })
    $('.withdrawal-form').on('submit', function(e) {
        e.preventDefault();
        let withdrawalBtn = $(this).find('.withdrawal-btn');
        let formData = $(this).serialize();
        let btnWidth = withdrawalBtn.outerWidth();
        let $this = $(this);
        $.ajax({
            url: "send/xhrWithdraw",
            method: "POST",
            dataType: 'json',
            data: formData,
            beforeSend: function() {
                toastr.clear();
                withdrawalBtn.html('<i class="spinner-border-sm spinner-border"></i>');
                withdrawalBtn.attr('disabled', true);
                withdrawalBtn.css('width', (btnWidth + 0.5) + 'px');
                toastr.info(`Processing... <i class="spinner-border-sm spinner-border"></i>`, "", {
                    positionClass: "toast-top-center",
                    onclick: null,
                    timeOut: 5000
                })
            },
            success: function(data) {
                toastr.clear();
                if (data.message == 'success') {
                    toastr.success(`Transfer is being processed... <i class="spinner-border-sm spinner-border"></i>`, "", {
                        positionClass: "toast-top-center",
                        showEasing: "swing",
                        timeOut: 0,
                        extendedTimeOut: 0,
                    })
                    $("#transaction_modal").modal('show');
                    for (var key in data.array) {
                        $('.transaction-' + key).html(data.array[key]);
                    }
                    $("#transaction_modal").on('hide.bs.modal', function() {
                        $this[0].reset();
                        toastr.clear();
                        setTimeout(function() {
                            window.history.back();
                        }, 1000);
                    })
                } else if (data.message == 'gas') {
                    Swal.fire({
                        icon: "warning",
                        title: "Oops...",
                        text: "You don't have enough Ethereum(ETH) to cover network and gas fee!",
                        footer: 'Please contact support @ <a href="mailto:support@bespend.com">support@bespend.com</a>',
                        confirmButtonText: 'Close'
                    });
                } else {
                    toastr.error(data.message, "", {
                        onclick: null
                    })
                }
                withdrawalBtn.html('Submit');
                withdrawalBtn.attr('disabled', false);

            }

        })
    })
    $('#coin-from').on('change', function(e) {
        let imageSrc = $(this).find(':selected').data('src');
        $(this).prev().find('.from_logo').attr('src', imageSrc);
        $('#assetBal').html($(this).find(':selected').data('balance'));
        let symbol1 = $(this).find(':selected').data('symbol');
        let symbol2 = $('#coin-to').find(':selected').data('symbol');
        if (symbol1 == symbol2) {
            var selected = $('#coin-to').find(':selected');
            selected.removeAttr('selected');
            selected.next().attr('selected', 'selected');
            selected.next().trigger('change');
        }
        $('#swap_amount').trigger('change');
    })
    $('#coin-to').on('change', function(e) {
        let imageSrc = $(this).find(':selected').data('src');
        $(this).prev().find('.to_logo').attr('src', imageSrc);
        let symbol1 = $(this).find(':selected').data('symbol');
        let symbol2 = $('#coin-from').find(':selected').data('symbol');
        if (symbol1 == symbol2) {
            var selected = $('#coin-from').find(':selected');
            selected.removeAttr('selected');
            selected.next().attr('selected', 'selected');
            selected.next().trigger('change');
        }
        $('#swap_amount').trigger('change');
    })
    $('#swap_amount').on('keyup change', function(e) {
        let from = parseFloat($('#coin-from').find(':selected').data('value'));
        let to = parseFloat($('#coin-to').find(':selected').data('value'));
        let value = parseFloat($(this).val());
        value = value / from;
        let amt = value / to;
        let rate = from / to;
        let output = (rate * value);
        let to_name = $('#coin-to').find(':selected').data('symbol');
        let from_name = $('#coin-from').find(':selected').data('symbol');
        output = isNaN(output) ? 0 : output;
        output = nrOfDecimals(output);
        if ((output - Math.floor(output)) == 0) {
            output = parseInt(output);
        }
        $('.swap_receive').html(output + ' ' + to_name);
        $('.ref_price').html('1 ' + from_name + ' ~ ' + rate.toFixed(7) + ' ' + to_name);
    })

    function nrOfDecimals(number) {
        var match = ('' + number).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
        if (!match) {
            return 0;
        }

        var decimals = Math.max(0,
            (match[1] ? match[1].length : 0)
            // Correct the notation.
            -
            (match[2] ? +match[2] : 0));

        if (decimals > 8) {
            //if decimal are more then 8
            number = parseFloat(number).toFixed(8);
        }
        //else no adjustment is needed
        return number;
    }
    $('body').on('submit', '.confirm_purchase_form', function(e) {
        e.preventDefault();
        let purchaseBtn = $(this).find('.confirm_purchase_btn');
        let formData = $(this).serialize();
        let $this = $(this);
        $.ajax({
            url: "swap/xhrTrade",
            method: "POST",
            data: formData,
            beforeSend: function() {
                purchaseBtn.html('<i class="spinner-border-sm spinner-border"></i>');
                purchaseBtn.attr('disabled', true);
            },
            success: function(data) {
                if (data == 'success') {
                    toastr.success("The trade is currently being processed.");
                    setTimeout(function() {
                        window.location.reload();
                    }, 2000)
                    $this[0].reset();
                } else if (data == "gas") {
                    Swal.fire({
                        icon: "warning",
                        title: "Oops...",
                        text: "You don't have enough Ethereum(ETH) to cover network and gas fee!",
                        footer: 'Please contact support @ <a href="mailto:support@bespend.com">support@bespend.com</a>',
                        confirmButtonText: 'Close'
                    });
                } else {
                    toastr.error(data)
                }
                purchaseBtn.html('Confirm Swap');
                purchaseBtn.attr('disabled', false);

            }

        })
    })
})