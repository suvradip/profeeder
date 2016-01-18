(function(){


var PROFEEDER = {};

//storing window height and size
PROFEEDER.windowHeight = $(document).height();
PROFEEDER.windowWidth = $(window).width();
//chart type
PROFEEDER.charts = [
'select', 'area2d', 'bar2d', 'bar3d', 'column2d'
];


//setup div size according to viewport
var headerH = $('.wrapper .header').outerHeight();
var footerH = $('.wrapper .footer').outerHeight();
var contenHeight = PROFEEDER.windowHeight - (headerH + footerH + 6);
$('.wrapper .sidebar').css('height', contenHeight);
$('.wrapper .container').css('height', contenHeight);


//elemnet making
PROFEEDER.element = {
	select: function(start, end, array){
				var temp;
				temp = '<select>';

				if(array !== 'undefined' &&  array instanceof Array)
				{
					for(var i=start; i<end; i++)
						temp += '<option>'+ array[i] +'</option>' ;				
				} else {
					for(var i=start; i<=end; i++)
						temp += '<option>'+ i +'</option>' ;
				}
				temp += '</select>';
				return temp;
			}
};


//chart dropdown list and binding event
$('.sidebar').append(PROFEEDER.element.select(0,PROFEEDER.charts.length, PROFEEDER.charts)).promise().done(function(){
	$(this).on('change', function(event) {

		//clearing this div content.
		$('.chart-attribute-settings').empty();
		PROFEEDER.currentChartType = event.target.value;
		PROFEEDER.chartAttributes.returnData = PROFEEDER.chartAttributes();

		//sidebar navigation onClick list appear
		window.setTimeout(function(){
			$('.items').on('click', function(event) {
			$('ul li').removeClass("items_highlight");
			$(this).addClass('items_highlight');
			PROFEEDER.viewAttributes($(this).children('a').text());
			});
		}, 2000);
		
		PROFEEDER.chartData.returnData =PROFEEDER.chartData();
	});
});


//sidebar attribute list 
PROFEEDER.chartAttributes = (function (){
	//to prevent catch load
	var data = $.getJSON( 'assets/js/attributes/'+ PROFEEDER.currentChartType +'.json?nocache='+(Math.random()*100 + 0.5), function( data ) {
	//remove previous attribute list
	if($('ul'))
	$('ul').remove();

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

	return data;
});


// render chart
PROFEEDER.chartData = (function (){
		//to prevent catch load
		var data = $.getJSON('assets/js/chart/'+ PROFEEDER.currentChartType +'.json?nocache='+(Math.random()*100 + 0.5), function(data) {
		var fc = new FusionCharts(data).render();
		$('.code-area textarea').val(JSON.stringify(data, null, 4));
		return data;
	});

	return data;	
});



//on changes in textArea
$('.code-area textarea').change(function(event) {
	for (var charts in FusionCharts.items)
        FusionCharts.items[charts].dispose();
		 new FusionCharts(JSON.parse(event.target.value)).render();
	PROFEEDER.chartData.returnData.responseJSON = JSON.parse(event.target.value);
	PROFEEDER.viewAttributes();
});

//attribute set
PROFEEDER.setAttribute = (function(param){
	debugger;
	var attr = PROFEEDER.chartData.returnData.responseJSON;
	delete attr.dataSource.setData;
	if(attr.dataSource.hasOwnProperty('chart'))
		attr.dataSource.chart[param.key] = param.value;
	
	
	PROFEEDER.chartData.returnData.responseJSON = attr;
	for (var charts in FusionCharts.items)
        FusionCharts.items[charts].dispose();
            

	var textarea = $('.code-area textarea');
	textarea.val(JSON.stringify(attr, null, 4));	
	new FusionCharts(JSON.parse(textarea.val())).render();
	
});

//element creation and set events
PROFEEDER.viewAttributes = (function(param){
	if(typeof param === 'undefined')
	param = PROFEEDER.viewAttributes.param;
		
	$('.chart-attribute-settings').text('');
	$.each(PROFEEDER.chartAttributes.returnData.responseJSON, function(index_1, val_1) {
		if(val_1.table === param)
		{
			$.each(val_1.attrs, function(index_2, val_2) {
				$('.chart-attribute-settings').append(
					$('<p>').append(function(){
						$(this).attr('style', 'box-sizing: border-box; '+
							'display:inline-block; *zoom:1; *display:inline;'+
							' padding:3px 5px; width:33.3%; margin:0;');
						$(this).append($('<label style="display:inline-block;'+
							' min-width:150px;" for="L'+ index_1 + '_' +index_2 +
							'" title="'+ val_2.description+'">').text(val_2.name));
							
						var temp = PROFEEDER.chartData.returnData.responseJSON.dataSource;
						temp.setData = temp.chart.hasOwnProperty(val_2.name) ? temp.chart[val_2.name] : "";

						if(val_2.type === 'Boolean')
							$(this).append('<input type="checkbox" id="L'+ index_1 + '_' +index_2 +'" '+ (temp.setData  !== "" ? "checked" : "" ) +' /> ');
						if(val_2.type === 'Color')
							$(this).append('<input type="color" value="'+ (temp.setData) +'" /> ');

						if(val_2.type === 'Number')
						{
							if(val_2.range.indexOf('-') > -1)
							{
								var range = val_2.range.split('-');						
								$(this).append(PROFEEDER.element.select(range[0].trim(),range[1].trim())).promise().done(function(){
									$(this.children('select')).append('<option>select</option>');
									$(this.children('select')).val((temp.setData !== "" ? temp.setData : "select"));
								});
							} else
								$(this).append('<input type="number" value="'+ (temp.setData) +'" /> ');
						}	
							
						//if(val_2.type === 'Number')
						//	$(this).append('<input type="number" value="'+ (temp.setData) +'" /> ');	

						if(val_2.type === 'String' &&  typeof (val_2.range) !== 'undefined'){
							if(val_2.range !== ''){
								var range = val_2.range.split(',');
								$(this).append(PROFEEDER.element.select(0,range.length,range)).promise().done(function(){
									
									$(this.children('select')).append('<option>select</option>');
									$(this.children('select')).val((temp.setData !== "" ? temp.setData : "select"));

								});
							}

							if(val_2.range === '')
								$(this).append('<input type="text" value="'+ (temp.setData ) +'" /> ');
						}

						if(val_2.type === 'String' &&  typeof (val_2.range) === 'undefined')
							$(this).append('<input type="text" value="'+ (temp.setData ) +'" /> ');

						
					}));
			});
		}	
	});

		//set possible events for each element
		$('input[type="checkbox"]').on('click' , function(event) {
			console.log('test');
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

		$('input[type="color"], input[type="number"], input[type="text"]').change(function(event) {
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

		//set last selected sidebar cosmetic
		PROFEEDER.viewAttributes.param = param;	
	});

window.PROFEEDER = PROFEEDER;
})();


