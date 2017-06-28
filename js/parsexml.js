
var parsexml=exports;


var fs = require('fs');
var expat = require('node-expat');

var util=require('util');
var ls=function(a) { console.log(util.inspect(a,{depth:null})); }


parsexml.import=function(filename)
{
	
	var elems={}
	
	var json=[];
	var stack=[];
	var top={};stack.push(top);
	var cdata=false;

	var parser = new expat.Parser('UTF-8');

	parser.on('startElement', function (name, attrs) {
//		var parent=top;
		top={};stack.push(top);
		for(n in attrs) { top[n]=attrs[n]; }
		top[0]=name;
//		if(!parent[1]){ parent[1]=[]; }
//		parent[1].push(top);

		elems[name]=(elems[name] || 0)+1

	});

	parser.on('endElement', function (name) {
		stack.pop();
		top=stack[stack.length-1];

		if(stack.length==1)
		{
			ls(elems)
		}
	});

	parser.on('text', function (text) {
		text=text.trim();
		if(text!="") // ignore white space
		{
			if(!top[1]) {	top[1]=[];	}
			if(cdata)	{ 	top[1].push( (text) );	}
			else		{	top[1].push( (text) );	}
		}
	});

// maintain cdata text flag
	parser.on('startCdata', function () { cdata=true; });
	parser.on('endCdata', function () { cdata=false; });

//error?
	parser.on('error', function (error) {
		console.error("\n XML ERROR "+error+" : "+filename);
	});

	fs.createReadStream(filename).pipe(parser);


	return stack[0][1];
}
