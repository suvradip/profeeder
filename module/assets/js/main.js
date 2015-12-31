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
				$('<li>').attr('class', 'items').append($('<a>').text(data[i].table)));			
		});
	}));
return data;
});



//initial render chart
PROFEEDER.chartData = $.getJSON('assets/js/chart/column2d.json', function(data) {
	var fc = new FusionCharts(data).render();
	$('.code-area textarea').val(JSON.stringify(data, null, 4));

	// $.each(PROFEEDER.chartAttributes.responseJSON, function(index, obj) {
	// 	$.each(obj.attrs, function(index, val) {
	// 		if(obj.hasOwnProperty)
	// 	});
	// });

	return data;
});

//sidebar navigation onClick list appear
window.setTimeout(function(){
	$('.items').on('click', function(event) {
	//$(this).children('ul').toggle('slow');
	PROFEEDER.viewAttributes($(this).children('a').text());
});
}, 2000);

//on changes in textArea
$('.code-area textarea').change(function(event) {
	FusionCharts.items[Object.keys(FusionCharts.items)].dispose();
	var fc = new FusionCharts(JSON.parse(event.target.value)).render();
	PROFEEDER.chartData.responseJSON = JSON.parse(event.target.value);
});

//attribute set
PROFEEDER.setAttribute = (function(param){
	var attr = PROFEEDER.chartData.responseJSON;
	
	if(attr.dataSource.hasOwnProperty('chart'))
		attr.dataSource.chart[param.key] = param.value;
	
	
	PROFEEDER.chartData.responseJSON = attr;
	FusionCharts.items[Object.keys(FusionCharts.items)].dispose();

	var textarea = $('.code-area textarea');
	textarea.val(JSON.stringify(attr, null, 4));	
	var fc = new FusionCharts(JSON.parse(textarea.val())).render();
	
});

//elemnet making
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

//element creation and set events
PROFEEDER.viewAttributes = (function(param){
	$('.chart-attribute-settings').text('');
	$.each(PROFEEDER.chartAttributes.responseJSON, function(index_1, val_1) {
		if(val_1.table === param)
		{
			$.each(val_1.attrs, function(index_2, val_2) {
				$('.chart-attribute-settings').append(
					$('<p>').append(function(){
						$(this).attr('style', 'box-sizing: border-box; display:inline-block; *zoom:1; *display:inline; padding:3px 5px; width:33.3%; margin:0;');
						$(this).append($('<label style="display:inline-block; min-width:150px;" for="L'+ index_1 + '_' +index_2 +'" title="'+ val_2.description+'">').text(val_2.name));
						
						if(val_2.type === 'Boolean')
							$(this).append('<input type="checkbox" id="L'+ index_1 + '_' +index_2 +'"/> ');
						if(val_2.type === 'Color')
							$(this).append('<input type="color" /> ');
						if(val_2.type === 'Number')
							$(this).append('<input type="number" /> ');	

						if(val_2.type === 'String' &&  typeof (val_2.range) !== 'undefined'){
							if(val_2.range !== ''){
								var range = val_2.range.split(',');
								$(this).append(PROFEEDER.element.select(0,range.length,range));
							}

							if(val_2.range === '')
								$(this).append('<input type="text" /> ');
						}

						if(val_2.type === 'String' &&  typeof (val_2.range) === 'undefined')
							$(this).append('<input type="text" /> ');
							

					}));
			});
		}	
	});

		//set possible events for each element
		$('input[type="checkbox"]').on('click' , function(event) {
			var param ={};
			param.key = $(this).prev().text();
	
			if(event.target.type === 'checkbox'){
		
				if($(this).prop('checked'))
					param.value =1;
				else
					param.value =0;	
			}

			if(event.target.type === 'text')
				param.value = $(this).val();
			
			if(event.target.type === 'number')
				param.value = $(this).val();

			PROFEEDER.setAttribute(param);
		});

		$('input[type="color"], input[type="number"]').change(function(event) {
			var param = {};
			param.key = $(this).prev().text();
			param.value = event.target.value;
			PROFEEDER.setAttribute(param);
		});

		$('select').change(function(event) {
			var param = {};
			param.key = $(this).prev().text();
			param.value = event.target.value;
			PROFEEDER.setAttribute(param);
		});
});






})();


