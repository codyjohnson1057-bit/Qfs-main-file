$(document).on('contextmenu', 'a,img,input[type=image]', function() {
    return false
});
if (typeof Sys != 'undefined') {
    var prm = Sys.WebForms.PageRequestManager.getInstance();
    prm.add_initializeRequest(prm_InitializeRequest);
    prm.add_endRequest(prm_EndRequest);

    function prm_InitializeRequest(snd, e) {
        prm._scrollPosition = null;
        $("body").addClass("wait");
        var wait = $('#wait');
        if (wait.length != 1) {
            $("body").append('<label id="wait">Processing...</label>')
        };
        wait.attr('style', 'top:0;');
        try {
            var $bt = $get(e._postBackElement.id);
            if ($($bt).is('[type]')) {
                if ($bt.type == 'submit' || $bt.type == 'button' || $bt.type == 'image') {
                    $bt.disabled = true
                }
            }
        } catch (e) {}
    }

    function prm_EndRequest(snd, e) {
        $("body").removeClass("wait");
        $('#wait').attr('style', 'top:-100px;transition:5s');
        $(".pre_load_hsfrqy").fadeOut(1000);
        try {
            var $snd = $get(snd._postBackSettings.sourceElement.id);
            $snd.disabled = false;
            if (snd._postBackSettings.panelsToUpdate != null) {
                if (e.get_error() != null) {
                    var ex = e.get_error();
                    console.error('HttpStatusCode:' + ex.httpStatusCode, '\n', 'Name:' + ex.name, '\n', 'Message:' + ex.message, '\n', 'Description:' + ex.description);
                    if (typeof alertify != 'undefined') {
                        alertify.error('An error occured')
                    };
                    e.set_errorHandled(true)
                }
            }
        } catch (e) {}
    }
};
if (typeof alertify != 'undefined') {
    alertify.alert().setting({
        closableByDimmer: false
    })
}
if (typeof Offline != 'undefined') {
    var root = $('script[src*=offline\\.min\\.js]').attr('src');
    root = root.substring(0, root.indexOf('/js/') + 1);
    Offline.options = {
        checkOnLoad: false,
        interceptRequests: true,
        reconnect: {
            initialDelay: 3
        },
        requests: true,
        game: false,
        checks: {
            image: {
                url: root + 'images/pattern.png?' + new Date().getTime().toString()
            },
            active: 'image'
        }
    }
}