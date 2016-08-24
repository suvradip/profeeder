(function(){


var PROFEEDER = {};

//storing window height and size
PROFEEDER.windowHeight = $(document).height();
PROFEEDER.windowWidth = $(window).width();
//chart type
PROFEEDER.charts = [
'select', 'area2d', 'bar2d', 'bar3d', 'column2d', 'msbar2d', 'angulargauge'
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
					for(var k=start; k<=end; k++)
						temp += '<option value="'+ (k-1) +'">'+ k +'</option>' ;
				}
				temp += '</select>';
				return temp;
			},

	setElements : function(elementObj){
		
		$(elementObj.class).empty();
		
		$.each(elementObj.attrList, function( _index, _value) {
			$(elementObj.class).append(
				$('<p>').append(function(){
					$(this).attr('style', 'box-sizing: border-box; '+
						'display:inline-block; *zoom:1; *display:inline;'+
						' padding:3px 5px; width:33.3%; margin:0;');
					$(this).append($('<label style="display:inline-block;'+
						' min-width:150px;" for="L'+ elementObj.index + '_' + _index +
						'" title="'+ _value.description+'">').text(_value.name));
					
					var _setData ;
					if(typeof elementObj.attrs !== 'undefined')	
					 _setData = elementObj.attrs.hasOwnProperty(_value.name) ? elementObj.attrs[_value.name] : "";

					if(_value.type === 'Boolean')
						$(this).append('<input type="checkbox" id="L'+ elementObj.index + '_' + _index +'" '+ 
							( _setData  === "1" || _value.name.toLowerCase() === 'showlabel' ? 
								"checked" : "" ) +' /> ');
					if(_value.type === 'Color')
						$(this).append('<input type="color" value="'+ ( _setData !== "" ? _setData : '#000000' ) +'" /> ');

					if(_value.type === 'Number')
					{
						if(_value.range.indexOf('-') > -1)
						{
							var range = _value.range.split('-');						
							$(this).append(PROFEEDER.element.select(range[0].trim(),
								range[1].trim())).promise().done(function(){
								$(this.children('select')).prepend('<option>select</option>');
								$(this.children('select')).val(( _setData !== "" ?  _setData : "select"));
							});
						} else
							$(this).append('<input type="number" value="'+ ( _setData) +'" /> ');
					}	
						
					if(_value.type === 'String' &&  typeof (_value.range) !== 'undefined'){
						if(_value.range !== ''){
							var rng = _value.range.split(',');
							$(this).append(PROFEEDER.element.select(0,rng.length,rng)).promise().done(function(){
								
								$(this.children('select')).prepend('<option>select</option>');
								$(this.children('select')).val(( _setData !== "" ?  _setData + 1 : "select"));

							});
						}

						if(_value.range === '')
							$(this).append('<input type="text" value="'+ ( _setData ) +'" /> ');
					}

					if(_value.type === 'String' &&  typeof (_value.range) === 'undefined')
						$(this).append('<input type="text" value="'+ ( _setData ) +'" /> ');

					
				}));
			});


	PROFEEDER.setEventOnElemennts();
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
			delete PROFEEDER.path;
			PROFEEDER.viewAttributes({'name': $(this).children('a').text(),'class': '.chart-attribute-settings',
			 'next':true});
			});
		}, 2000);
		
		PROFEEDER.chartData.returnData =PROFEEDER.chartData();
	});
});


//sidebar attribute list 
PROFEEDER.chartAttributes = (function (){
	//to prevent catch load
	var data = $.getJSON( 'assets/js/attributes/'+ PROFEEDER.currentChartType +'.json?nocache='+
		(Math.random()*100 + 0.5), function( data ) {
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
		var data = $.getJSON('assets/js/chart/'+ PROFEEDER.currentChartType +'.json?nocache='+
			(Math.random()*100 + 0.5), function(data) {
		var fc = new FusionCharts(data).render();
		$('.code-area textarea').val(JSON.stringify(data, null, 4));
		return data;
	});

	return data;	
});


PROFEEDER.readTextArea = (function(path){
	if(path)
	return JSON.parse($('.code-area textarea').val()).dataSource[path];
	else
	return JSON.parse($('.code-area textarea').val());	
});

//on changes in textArea
$('.code-area textarea').change(function(event) {
	for (var charts in FusionCharts.items)
        FusionCharts.items[charts].dispose();
		 new FusionCharts(JSON.parse(event.target.value)).render();
	PROFEEDER.chartData.returnData.responseJSON = JSON.parse(event.target.value);
	PROFEEDER.viewAttributes({'class': '.chart-attribute-settings', 'next':true});
});

//attribute set
PROFEEDER.setAttribute = (function(paramData){
	
	var attr = PROFEEDER.chartData.returnData.responseJSON;
	//temporary fix
	delete attr.dataSource.setData;

	var opt = ['showlabel', 'showvalues'];
	//remove the disable attributes
	if((paramData.value === 'select' || paramData.value === 0 || paramData.value === '') && 
		opt.indexOf(paramData.key.toLowerCase()) <= -1){

		//for chart operation
		if(paramData && !PROFEEDER.path)
		delete attr.dataSource.chart[paramData.key];	

		//for data operation
		else if(paramData && PROFEEDER.path === 'data' && 
			PROFEEDER.level !== 'select' )
			delete attr.dataSource.data[PROFEEDER.level][paramData.key];

		//for data-level operation
		else if(paramData && PROFEEDER.path === 'data' && 
			PROFEEDER.level === 'select')
			delete attr.dataSource.chart[paramData.key];

		//for category-level operation
		else if(paramData && PROFEEDER.path === 'category' &&
			PROFEEDER.level !== 'select')
			delete attr.dataSource.categories[0].category[PROFEEDER.level][paramData.key] ;
		
		//for trendline operation
		else if(paramData && PROFEEDER.path === 'line' ){
			delete attr.dataSource.trendlines[0].line[0][paramData.key];
		}

		paramData = {};
	}

	//include attribute in chart object
	if(attr.dataSource.hasOwnProperty('chart') && paramData && !PROFEEDER.path)
		attr.dataSource.chart[paramData.key] = paramData.value;

	//include attribute in data object
	if(attr.dataSource.hasOwnProperty('data') && paramData && 
		PROFEEDER.path === 'data' && 
		PROFEEDER.level !== 'select')
		attr.dataSource.data[PROFEEDER.level][paramData.key] = paramData.value;
	else if(attr.dataSource.hasOwnProperty('data') && paramData && 
		PROFEEDER.path === 'data' && 
		PROFEEDER.level === 'select')
		attr.dataSource.chart[paramData.key] = paramData.value;
	
	//inlude attribute in trendline object
	if(!attr.dataSource.hasOwnProperty('trendlines') && paramData && 
		PROFEEDER.path === 'line' ){
		var temp = {};
		temp[paramData.key]	= paramData.value;
		attr.dataSource.trendlines = [];
		var line = [];
		line.push(temp);
		var test = {};
		test.line = line;
		attr.dataSource.trendlines.push(test);
   		
	}else if(attr.dataSource.hasOwnProperty('trendlines') && paramData && 
		PROFEEDER.path === 'line' ){
		attr.dataSource.trendlines[0].line[0][paramData.key] = paramData.value;
	}

	//include attribute in categories
	if(attr.dataSource.hasOwnProperty('categories') && paramData && 
		PROFEEDER.path === 'categories')
		attr.dataSource.categories[0][paramData.key] = paramData.value;

	//include attribute in category
	if(attr.dataSource.hasOwnProperty('categories') && paramData && 
		PROFEEDER.path === 'category'  && PROFEEDER.level !== 'select' )
		attr.dataSource.categories[0].category[PROFEEDER.level][paramData.key] = paramData.value;


	PROFEEDER.chartData.returnData.responseJSON = attr;
	for (var charts in FusionCharts.items)
        FusionCharts.items[charts].dispose();
            

	var textarea = $('.code-area textarea');
	textarea.val(JSON.stringify(attr, null, 4));	
	new FusionCharts(JSON.parse(textarea.val())).render();
	
});
//element creation and set events
PROFEEDER.viewAttributes = (function(paramObj){

	if(paramObj.hasOwnProperty('name'))
	param = paramObj.name;
	else
	param = PROFEEDER.viewAttributes.param;	
		
	var temp = PROFEEDER.chartData.returnData.responseJSON.dataSource;	
	//$(paramObj.class).empty();
	$.each(PROFEEDER.chartAttributes.returnData.responseJSON, function(index_1, val_1) {
		if(val_1.table === param)
		{
			// $.each(val_1.attrs, function(index_2, val_2) {
			// $(paramObj.class).append(
			// 	$('<p>').append(function(){
			// 		$(this).attr('style', 'box-sizing: border-box; '+
			// 			'display:inline-block; *zoom:1; *display:inline;'+
			// 			' padding:3px 5px; width:33.3%; margin:0;');
			// 		$(this).append($('<label style="display:inline-block;'+
			// 			' min-width:150px;" for="L'+ index_1 + '_' +index_2 +
			// 			'" title="'+ val_2.description+'">').text(val_2.name));
						
			// 		temp.setData = temp.chart.hasOwnProperty(val_2.name) ? temp.chart[val_2.name] : "";

			// 		if(val_2.type === 'Boolean')
			// 			$(this).append('<input type="checkbox" id="L'+ index_1 + '_' +index_2 +'" '+ 
			// 				(temp.setData  === "1" || val_2.name.toLowerCase() === 'showlabel' ? 
			// 					"checked" : "" ) +' /> ');
			// 		if(val_2.type === 'Color')
			// 			$(this).append('<input type="color" value="'+ (temp.setData) +'" /> ');

			// 		if(val_2.type === 'Number')
			// 		{
			// 			if(val_2.range.indexOf('-') > -1)
			// 			{
			// 				var range = val_2.range.split('-');						
			// 				$(this).append(PROFEEDER.element.select(range[0].trim(),
			// 					range[1].trim())).promise().done(function(){
			// 					$(this.children('select')).prepend('<option>select</option>');
			// 					$(this.children('select')).val((temp.setData !== "" ? temp.setData : "select"));
			// 				});
			// 			} else
			// 				$(this).append('<input type="number" value="'+ (temp.setData) +'" /> ');
			// 		}	
						
			// 		if(val_2.type === 'String' &&  typeof (val_2.range) !== 'undefined'){
			// 			if(val_2.range !== ''){
			// 				var rng = val_2.range.split(',');
			// 				$(this).append(PROFEEDER.element.select(0,rng.length,rng)).promise().done(function(){
								
			// 					$(this.children('select')).prepend('<option>select</option>');
			// 					$(this.children('select')).val((temp.setData !== "" ? temp.setData : "select"));

			// 				});
			// 			}

			// 			if(val_2.range === '')
			// 				$(this).append('<input type="text" value="'+ (temp.setData ) +'" /> ');
			// 		}

			// 		if(val_2.type === 'String' &&  typeof (val_2.range) === 'undefined')
			// 			$(this).append('<input type="text" value="'+ (temp.setData ) +'" /> ');

					
			// 	}));
			// });

			// PROFEEDER.element.setElements({ 'attrList': val_1.attrs,
			// 								'index': index_1,
			// 								'attrs': temp.chart,
			// 								'class': paramObj.class });
			
			if(!val_1.path){
			PROFEEDER.element.setElements({ 'attrList': val_1.attrs,
											'index': index_1,
											'attrs': temp.chart,
											'class': paramObj.class });

			} else if(val_1.path && val_1.path !=='categories' ){

			var config ={};
			PROFEEDER.path = val_1.path;

			if(val_1.path ==='data'){	
			PROFEEDER.element.setElements({ 'attrList': val_1.attrs,
			 								'index': index_1,
			 								'attrs': temp.data,
			 								'class': paramObj.class });
			config.length = temp.data.length;
			}

			if(val_1.path ==='category'){	
			PROFEEDER.element.setElements({ 'attrList': val_1.attrs,
			 								'index': index_1,
			 								'attrs': temp.categories[0].category,
			 								'class': paramObj.class });	
			config.length = temp.categories[0].category.length;
			}
							
			if(val_1.path ==='line'){	
			PROFEEDER.element.setElements({ 'attrList': val_1.attrs,
			 								'index': index_1,
			 								'attrs': (temp.hasOwnProperty('trendlines') ? 
			 											temp.trendlines[0].line :'undefined'),
			 								'class': paramObj.class });
			config.length = temp.hasOwnProperty('trendlines') ? temp.trendlines[0].line.length : 0;
			} 									

			
			$('.chart-attribute-settings').prepend(
					$('<div class="data-attr">').append(function(){
						$(this).append(
							$('<p>').append(function(){
								$(this).text('select ' + val_1.path + ' level' );
								$(this).append(PROFEEDER.element.select(1, config.length));
								$(this).children('select').prepend('<option>select</option>');
								$(this).children('select').val("select");
								$(this).children('select').off();
								//default depth
								PROFEEDER.level = 'select';
								//if level change
								$(this).children('select').on('click', function(event) {
									PROFEEDER.level = event.target.value;

								});


							}));				
					}));
			
			} else if(val_1.path ==='categories'){
				PROFEEDER.path = val_1.path;
				PROFEEDER.element.setElements({ 'attrList': val_1.attrs,
			 								'index': index_1,
			 								'attrs': temp.categories[0],
			 								'class': paramObj.class });	

			}



		}	
	});

		//set possible events for each element
		//PROFEEDER.setEventOnElemennts();

		//set last selected sidebar cosmetic
		PROFEEDER.viewAttributes.param = param;	
	});

//event controller
PROFEEDER.setEventOnElemennts = (function(){
	$('input[type="checkbox"]').on('click' , function(event) {
			var paramData ={};
			paramData.key = $(this).prev().text();
			paramData.tag = param;

			if(event.target.type === 'checkbox'){
		
				if($(this).prop('checked'))
					paramData.value =1;
				else
					paramData.value =0;	
			}

			if(event.target.type === 'text')
				paramData.value = $(this).val();
			
			if(event.target.type === 'number')
				paramData.value = $(this).val();

			PROFEEDER.setAttribute(paramData);

		});

		$('input[type="color"], input[type="number"], input[type="text"]').change(function(event) {
			var paramData = {};
			paramData.key = $(this).prev().text();
			paramData.value = event.target.value;
			PROFEEDER.setAttribute(paramData);
		});

		$('select:not(.data-attr select)').change(function(event) {
			var param = {};
			param.key = $(this).prev().text();
			param.value = event.target.value;
			PROFEEDER.setAttribute(param);
		});
});

 PROFEEDER.takeOverConsole = function(){
    var original = window.console;
    window.console = {
        log: function(){
            // do sneaky stuff
            arguments = "hello";
            original.log.apply(original, arguments);
        },
        warn: function(){
            // do sneaky stuff
            original.warn.apply(original, arguments);
        },
        error: function(){
            // do sneaky stuff
            original.error.apply(original, arguments);
        }
    };
};


window.PROFEEDER = PROFEEDER;
})();


