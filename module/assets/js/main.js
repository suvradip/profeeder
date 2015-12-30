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
PROFEEDER.chartAttributes = $.getJSON( "assets/js/attributes/Column2D.json", function( data ) {
$('.sidebar').append(
	$('<ul>').append(function(){
		var para = $(this);
		$.each(data, function(i, el) {
			para.append(
				$('<li>').attr('class', 'items').append(function(){
					var child = $(this);

					child.append(
						$('<a>').text(data[i].table));

					// child.append(
					// 	$('<ul>').append(function(){
					// 	var gchild = $(this);
					// 	$.each(data[i].attrs, function(j, el) {
					// 	gchild.append(
					// 		$('<li>').append(
					// 			$('<a>').text(data[i].attrs[j].name)));	
					// 	});
					// }));
				}));			
		});
	}));
return data;
});



//initial render chart
PROFEEDER.chartData = $.getJSON('assets/js/chart/column2d.json', function(data) {
	var fc = new FusionCharts(data).render();
	$('.code-area textarea').text(JSON.stringify(data, null, 4));
	return data;
});

//sidebar navigation onClick list appear
window.setTimeout(function(){
	$('.items').on('click', function(event) {
	//$(this).children('ul').toggle('slow');
	PROFEEDER.viewAttributes($(this).children('a').text());
});
}, 2000);


PROFEEDER.setAttribute = (function(param){
	var attr = PROFEEDER.chartData.responseJSON;
	
	if(attr.dataSource.hasOwnProperty('chart'))
		attr.dataSource.chart[param.key] = param.value;
	
	
	PROFEEDER.chartData.responseJSON = attr;
	FusionCharts.items[Object.keys(FusionCharts.items)].dispose();

	$('.code-area textarea').text(JSON.stringify(attr, null, 4));	
	var fc = new FusionCharts(JSON.parse($('.code-area textarea').text())).render();
	
});


PROFEEDER.element = {
	select: function(start, end, array){
				var temp;
				temp = '<select>';

				if(array !== 'undefined' &&  array instanceof Array)
				{
					for(var i=start; i<end; i++)
						temp += '<option>'+ array[i] +'</option>' ;				
				} 
				temp += '</select>';
				return temp;
			}

};


PROFEEDER.viewAttributes = (function(param){
	$('.chart-attribute-settings').text('');
	$.each(PROFEEDER.chartAttributes.responseJSON, function(index_1, val_1) {
		if(val_1.table === param)
		{
			$.each(val_1.attrs, function(index_2, val_2) {
				$('.chart-attribute-settings').append(
					$('<p>').append(function(){
						$(this).attr('style', 'box-sizing: border-box; display:inline-block; *zoom:1; *display:inline; padding:3px 5px; width:33.3%; margin:0;');
						$(this).append($('<label for="L'+ index_1 + '_' +index_2 +'" title="'+ val_2.description+'">').text(val_2.name));
						if(val_2.type === 'Boolean')
							$(this).append('<input type="checkbox" id="L'+ index_1 + '_' +index_2 +'"/> ');
						if(val_2.type === 'Color')
							$(this).append('<input type="color" /> ');
						if(val_2.type === 'Number')
							$(this).append('<input type="number" /> ');			
						if(val_2.type === 'String' && val_2.range !== ''){
							var range = val_2.range.split(',');
							$(this).append(PROFEEDER.element.select(0,range.length,range));
						}
						if(val_2.type === 'String' && val_2.range === '')
							$(this).append('<input type="text" /> ');

					}));
			});
		}	
	});

		$('input').on('click' , function(event) {
			var param ={};
			param.key = $(this).prev().text();
	
			if($(this)[0].type === 'checkbox'){
				console.log('111');
				if($(this).prop('checked'))
					param.value =1;
				else
					param.value =0;	
			}

			if($(this)[0].type === 'text')
				param.value = $(this).val();
			
			if($(this)[0].type === 'number')
				param.value = $(this).val();

			PROFEEDER.setAttribute(param);
		});
});






})();


