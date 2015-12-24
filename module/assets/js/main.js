(function(){


var PROFEEDER = {};

//storing window height and size
PROFEEDER.windowHeight = $(window).height();
PROFEEDER.windowWidth = $(window).width();


//setup div size according to viewport

var headerH = $('.wrapper .header').outerHeight();
var footerH = $('.wrapper .footer').outerHeight();
var contenHeight = PROFEEDER.windowWidth - (headerH + footerH +170);
console.log(PROFEEDER.windowWidth +' '+contenHeight);
$('.wrapper .sidebar').css('height', contenHeight);
$('.wrapper .container').css('height', contenHeight);

})();


