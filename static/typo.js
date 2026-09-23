$(document).on('keydown', 'input[type="text"],input[type="email"],input[type="password"]', function(e) {
    if (e.keyCode === 13) {
        e.preventDefault()
    }
});
$(document).on("keydown", function(e) {
    if (e.keyCode === 70 && (e.ctrlKey || e.metaKey)) {
        var search = $('.Txtsearch[type="text"]');
        if (search.length !== 0) {
            if (!search.is(":focus")) {
                search.focus();
                e.preventDefault()
            }
        }
    }
});
$(document).on("drop", 'input[id*="Txtsearch"]', function(e) {
    e.preventDefault();
    $(this).val(fn(e.originalEvent.dataTransfer.getData('Text')))
});
$(document).on("keyup change paste", 'input[id*="Txtsearch"]', function() {
    var v = $.trim($(this).val());
    if (v != "") {
        var REG = new RegExp(/[^a-z0-9_&:#$()+@!.{}|/\\\s]/gi);
        if (REG.test(v)) {
            var result = v.replace(REG, "");
            $(this).val(result);
            showRestrict("Character not allowed")
        }
    }
});
$(document).on("keyup change paste drop", 'input[type=text]:not([data-tags]),input[type=email],textarea:not([data-tags])', function() {
    if ($(this).val() == '') {
        $(this).removeClass("not-valid")
    } else {
        $(this).addClass("not-valid");
        var v = $(this).val(),
            Reg = new RegExp(/(<([^>]+)>)/ig);
        if (Reg.test(v)) {
            var result = v.replace(Reg, "");
            $(this).val(result);
            showRestrict("Tags are not Allowed")
        }
    }
});

function fn(text) {
    var txt = $.trim(text);
    if (txt != "") {
        var regex = new RegExp(/[^a-z0-9_&:#$()+@!{}|/\\s]/gi);
        if (!regex.test(txt)) {
            text = ""
        }
    };
    return text
};

function showRestrict(v) {
    var seconds = 5,
        restrict = $('.rstrt');
    restrict.stop();
    $('.___echo').html(v);
    restrict.attr({
        "class": "rstrt _roll",
        "style": "right:10px"
    });
    setTimeout(function() {
        restrict.removeClass('_roll').animate({
            right: '-10000px'
        }, "slow")
    }, seconds * 1000)
};