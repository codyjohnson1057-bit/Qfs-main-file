function GenImage(self) {
    var s = $(self);
    $.get(srcGet + 'Files/Handlers/GenImage.ashx?q=' + s.attr('src'), function(d) {
        s.attr('src', d).css('border-radius', '50%')
    }, "text")
}