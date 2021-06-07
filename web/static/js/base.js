// Change selected navbar item
$(document).ready(function() {
    var page = window.location.pathname.split("/").pop();
    if (page) {
        $("." + page).addClass("active")
    } else {
        $(".home").addClass("active")
    }
});