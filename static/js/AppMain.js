function checkdetails() {
    var select = $(".impo").parent().find("select").filter(function() {
        return $(this).prop("selectedIndex") === 0
    }).length;
    var inputs = $(".impo").parent().find("input[type=text],input[type=password],input[type=email],textarea").filter(function() {
        return $.trim($(this).val()) == ""
    }).length;
    if (select !== 0 || inputs !== 0) {
        alertify.alert("Alert", "Please Fill in All Fields Marked With Asterisk");
        return false
    } else {
        return true
    }
};

function queryString(param) {
    var QS = new Array();
    if (QS.length == 0) {
        if (window.location.search.split('?').length > 1) {
            var params = window.location.search.split('?')[1].split('&');
            for (var i = 0; i < params.length; i++) {
                var key = params[i].split('=')[0];
                var value = decodeURIComponent(params[i].split('=')[1]);
                QS[key] = value
            }
        }
    };
    var x = function() {
        var k = QS[param];
        if (k) {
            return k.replace(/[+]/g, " ")
        } else {
            return ""
        }
    };
    return x()
};
$(document).on("click", "input[type='submit'][value='Cancel'],input[type='button'][value='Cancel']", function() {
    var input = $("input[type='text']:not([class*=Gnr]),input[type='password'],input[type='email'],input[type='file'],textarea");
    var select = $("select:not([class*=Gnr])");
    $(input).each(function() {
        $(this).val('');
        $(this).trigger("keyup")
    });
    $(select).each(function() {
        $(this).prop("selectedIndex", 0)
    })
});