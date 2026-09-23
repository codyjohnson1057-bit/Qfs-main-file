$('html').attr('data-useragent', navigator.userAgent).addClass('cl-preload');
$(window).on({
    'load': function() {
        $('html,body').animate({
            scrollTop: 0
        }, 'normal');
        $("#loader").fadeOut("slow", function() {
            $("#preloader").delay(300).fadeOut("slow")
        });
        $("html").removeClass('cl-preload').addClass('cl-loaded')
    },
    'scroll': function() {
        var Top = $(".cdl_top");
        if ($(window).scrollTop() >= 500) {
            Top.fadeIn(400)
        } else {
            Top.fadeOut(400)
        }
    }
});
$(document).on('click', '.smoothscroll', function(e) {
    $('html,body').stop().animate({
        'scrollTop': 0
    }, 800, 'swing').promise().done(function() {
        if ($('.us_sd_bar_shw').length) {
            $('.us_sd_bar_close').trigger('click')
        }
    })
})