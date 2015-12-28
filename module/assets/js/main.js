(function(){


var PROFEEDER = {};

//storing window height and size
PROFEEDER.windowHeight = $(document).height();
PROFEEDER.windowWidth = $(window).width();


//setup div size according to viewport
var headerH = $('.wrapper .header').outerHeight();
var footerH = $('.wrapper .footer').outerHeight();
var contenHeight = PROFEEDER.windowHeight - (headerH + footerH + 6);
$('.wrapper .sidebar').css('height', contenHeight);
$('.wrapper .container').css('height', contenHeight);




//sidebar item set

$.getJSON( "assets/js/attributes/Angular.json", function( data ) {
$('.sidebar').append(
	$('<ul>').append(function(){
		var para = $(this);
		$.each(data, function(i, el) {
			para.append(
				$('<li>').attr('class', 'items').append(function(){
					var child = $(this);

					child.append(
						$('<a>').text(data[i].table));

					child.append(
						$('<ul>').append(function(){
						var child1 = $(this);
						$.each(data[i].attrs, function(j, el) {
						child1.append(
							$('<li>').append(
								$('<a>').text(data[i].attrs[j].name)));	
						});
					}));
				}));			
		});
	}));

//sidebar navigation onClick list appear
$('.items').on('click', function(event) {
	$(this).children('.items ul').toggle('slow');
});
});

})();


