$(document).ready(function() {
    $('body').on('change', '#poi', function(e) {
        e.preventDefault();
        if ($(this).val()) {
            let file = document.getElementById('poi').files[0];
            if (window.FileReader) {
                let reader = new FileReader();
                reader.onloadend = function(e) {
                    $('.poi').attr('src', e.target.result);
                }
                reader.readAsDataURL(file);
            }
        } else {
            $('.poi').attr('src', $('.poi').data('prev'));
        }

    })
    $('body').on('change', '#poa', function(e) {
        e.preventDefault();
        if ($(this).val()) {
            let file = document.getElementById('poa').files[0];
            if (window.FileReader) {
                let reader = new FileReader();
                reader.onloadend = function(e) {
                    $('.poa').attr('src', e.target.result);
                }
                reader.readAsDataURL(file);
            }
        } else {
            $('.poa').attr('src', $('.poa').data('prev'));
        }
    })
});