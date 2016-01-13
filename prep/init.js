var fs = require('fs');

var attrFiles = fs.readdirSync('attr');

attrFiles.forEach(function(file){
	var fileData = JSON.parse(fs.readFileSync('attr/' +file));
	for(var i=0; i<fileData.length; i++)
	{
		if(!fileData[i].hasOwnProperty('path') || fileData[i].path === 'chart')
		{
			console.log(fileData[i].table);
		}
	}	
});