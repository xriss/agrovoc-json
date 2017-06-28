
var parsexml=exports;


var fs = require('fs');
var expat = require('node-expat');

var util=require('util');
var ls=function(a) { console.log(util.inspect(a,{depth:null})); }


parsexml.import=function(filename)
{
	
	var elems={}
	var tags={}
	
	var json=[];
	var stack=[];
	var top={};stack.push(top);
	var cdata=false;

	var parser = new expat.Parser('UTF-8');
	
	var desc={}
	var resource={}

	parser.on('startElement', function (name, attrs) {
//		var parent=top;
		top={};stack.push(top);
		for(n in attrs) { top[n]=attrs[n]; }
		top[0]=name;
//		if(!parent[1]){ parent[1]=[]; }
//		parent[1].push(top);

		elems[name]=(elems[name] || 0)+1

		if(top[0]=="rdf:Description")
		{
			if(top["rdf:about"])
			{
				var it
				var name=top["rdf:about"]
				
//				if( name.substr(0,2)=="c_" )
//				{
					desc=tags[ name ]
					if( ! desc )
					{
						desc={}
						tags[ name ]=desc
					}
//				}
//				else
//				{
//					desc=resource[ top["rdf:about"] ]
//				}
				
				if(desc)
				{
					desc.url=top["rdf:about"]
//					desc.name=name
				}
			}
		}
		
		if(top["rdf:resource"])
		{
			if( resource[ top["rdf:resource"] ] ) // do we have list
			{
				resource[ top["rdf:resource"] ].push(desc) // add to list
			}
			else
			{
				resource[ top["rdf:resource"] ]=[desc] // create new list
			}
		}
		

	});

	parser.on('endElement', function (name) {
		
		if(top[0]=="literalForm")
		{
			if( (top["xmlns"]=="http://www.w3.org/2008/05/skos-xl#") ) // && (top["xml:lang"]=="en") )
			{
				if(desc)
				{
					if( top["xml:lang"] && top[1] && top[1][0] )
					{
						desc[ top["xml:lang"] ]=top[1][0]
					}
				}
			}
		}

		stack.pop();
		top=stack[stack.length-1];

		if(stack.length==1)
		{
			var ids={}
			for(n in tags) { var v=tags[n]
				var name=n.replace("http://aims.fao.org/aos/agrovoc/","")
				if( name.substr(0,2)=="c_" )
				{
					ids[name]=v
				}
			}
			for(n in tags) { var v=tags[n]
				if( resource[ n ] )
				{
					var o=resource[ n ]
					if(o)
					{
						for(i=0;i<o.length;i++)
						{
							for(n2 in v) { o[i][n2]=o[i][n2] || v[n2] } // merge
						}
					}
				}
			}

			for(n in ids) { var v=ids[n]
				delete v.url
			}


//			ls(tags)
			ls(ids)
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
