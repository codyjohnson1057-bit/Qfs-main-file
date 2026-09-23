$(document).on("input keydown keyup mousedown mouseup select contextmenu drop", "input[data-valid='numb']", function() {
    if (/^\d*$/.test(this.value)) {
        this.oldValue = this.value;
        this.oldSelectionStart = this.selectionStart;
        this.oldSelectionEnd = this.selectionEnd;
        return
    }
    if (this.hasOwnProperty("oldValue")) {
        this.value = this.oldValue;
        this.setSelectionRange(this.oldSelectionStart, this.oldSelectionEnd)
    } else {
        this.value = ""
    }
    showRestrict("Only digits allowed")
});
$(document).on({
    "input keydown keyup mousedown mouseup select contextmenu drop": function() {
        if (!/[^0-9\.]/g.test(this.value)) {
            this.oldValue = this.value;
            this.oldSelectionStart = this.selectionStart;
            this.oldSelectionEnd = this.selectionEnd;
            return
        }
        if (this.hasOwnProperty("oldValue")) {
            this.value = this.oldValue;
            this.setSelectionRange(this.oldSelectionStart, this.oldSelectionEnd)
        } else {
            this.value = ""
        }
        showRestrict("Only decimals allowed")
    },
    "blur": function() {
        var s = $(this);
        s.val(parseFloat(s.val(), 10).round(2) || 0)
    }
}, "input[data-valid='decimal']");
Number.prototype.round = function(p) {
    return +(Math.round(this + 'e+' + p) + 'e-' + p)
}