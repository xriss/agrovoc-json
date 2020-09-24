// Copyright (c) 2014 International Aid Transparency Initiative (IATI)
// Licensed under the MIT license whose full text can be found at http://opensource.org/licenses/MIT

var cmd=exports;

var fs = require('fs');
var util=require('util');
var path=require('path');

var ls=function(a) { console.log(util.inspect(a,{depth:null})); }


cmd.run=async function(argv)
{
	if( argv._[0]=="import" )
	{
		var filename1=argv._[1] || argv.xml;
		var filename2=argv._[2] || argv.json;
		if(filename1)
		{
			return await require("./parsexml.js").parse(filename1,filename2);
		}
	}
	// help text
	console.log(
		"\n"+
		">	agrovoc-json parse filename.xml filename.json\n"+
		"Import agrovoc rdf xml and output a json file.\n"+
		"\n"+
		"\n"+
	"");
}

// if global.argv is set then we are inside another command so do nothing
if(!global.argv)
{
	var argv = require('yargs').argv; global.argv=argv;
	cmd.run(argv);
}
