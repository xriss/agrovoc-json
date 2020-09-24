
var parsexml=exports;


var fs = require('fs');
var sax = require('sax');

var json_stringify = require('json-stable-stringify')


var util=require('util');
var ls=function(a) { console.log(util.inspect(a,{depth:null})); }


parsexml.parse=async function(filename,filenameout)
{
	
	var write_tsv=function(filename,ids)
	{
		var lines=[]
		
		var dupe=function(dat)
		{
			var t=[]
			for(var i=0;i<dat.length;i++)
			{
				t[i]=dat[i]
			}
			return t
		}
		
		var recurse
		recurse=function(id,dat)
		{
			if(!dat) // init
			{
				dat=[]
			}
			dat.push(id)
			var it=ids[id]
			if(it.parents) // recurse
			{
				for(var ip in it.parents)
				{
					var vp=it.parents[ip]
					var dp=dupe(dat)
					recurse(vp,dp)
				}
			}
			else // stop and print
			{
				var t=[]
				for(var i=0;i<dat.length;i++)
				{
					t[i]= dat[i]+"\t"+ids[ dat[i] ].label
				}
				lines.push(t.join("\t"))
			}
		}
		for(var id in ids)
		{
			recurse(id)
		}
		
		lines.sort()		
		fs.writeFileSync( filename , lines.join("\n") )
	}
	var elems={}
	var tags={}
	
	var json=[];
	var stack=[];
	var top={};stack.push(top);
	var cdata=false;

	var parser = sax.createStream(false,{});
	
	var desc={}
	var resource={ label:{} , alt:{} , all:{} }
	var resource_names={"label":true}
	var resource_mode=""

	parser.onopentag=function (tag) {
		var name=tag.name
		var attrs=tag.attributes
//		var parent=top;
		top={};stack.push(top);
		for(n in attrs) { top[n]=attrs[n]; }
		top[0]=name;
//		if(!parent[1]){ parent[1]=[]; }
//		parent[1].push(top);

		elems[name]=(elems[name] || 0)+1

		if(top[0]=="RDF:DESCRIPTION".toUpperCase())
		{
			var url=top["RDF:ABOUT".toUpperCase()]
			if(url)
			{
				var it
				
				desc=tags[ url ]
				if( ! desc )
				{
					desc={}
					tags[ url ]=desc
				}
				
				if(desc)
				{
					desc.url=url
				}
			}
		}
		else
		if(top[0]=="PREFLABEL".toUpperCase())
		{
			resource_mode="label"
		}
		else
		if(top[0]=="ALTLABEL".toUpperCase())
		{
			resource_mode="alt"
		}
		
		if(top["RDF:RESOURCE"])
		{
			if( resource[resource_mode] )
			{
				if( resource[resource_mode][ top["RDF:RESOURCE"] ] ) // do we have list
				{
					resource[resource_mode][ top["RDF:RESOURCE"] ].push(desc) // add to list
				}
				else
				{
					resource[resource_mode][ top["RDF:RESOURCE"] ]=[desc] // create new list
				}

				if( resource.all[ top["RDF:RESOURCE"] ] ) // do we have list
				{
					resource.all[ top["RDF:RESOURCE"] ].push(desc) // add to list
				}
				else
				{
					resource.all[ top["RDF:RESOURCE"] ]=[desc] // create new list
				}

			}
		}
		

	}

	var pipcount=0;
	parser.onclosetag=function (name) {

		pipcount--
		if(pipcount<=0)
		{
			process.stdout.write(name[0]);
			pipcount=1000;
		}
		
		if(top[0]=="LITERALFORM")
		{
			if(desc)
			{
				if( top["XML:LANG"] && top[1] && top[1][0] )
				{
					desc.any=desc.any || top[1][0]
					desc[ top["XML:LANG"] ]=top[1][0]
				}
			}
		}
		else
		if(top[0]=="BROADER")
		{
			if(!desc.parents) { desc.parents=[] }
			var name=top["RDF:RESOURCE"].replace("http://aims.fao.org/aos/agrovoc/","")
			desc.parents.push(name)
		}

		stack.pop();
		top=stack[stack.length-1];
		
	}

	parser.ontext=function (text) {
		text=text.trim();
		if(text!="") // ignore white space
		{
			if(!top[1]) {	top[1]=[];	}
			if(cdata)	{ 	top[1].push( (text) );	}
			else		{	top[1].push( (text) );	}
		}
	}

// maintain cdata text flag
	parser.onopencdata=function () { cdata=true; }
	parser.onclosecdata=function () { cdata=false; }

//error?
	parser.onerror=function (error) {
		console.error("\n XML ERROR "+error+" : "+filename);
	}

	await new Promise((resolve, reject) => {
		fs.createReadStream(filename)
		.pipe(parser)
		.on('error',reject)
		.on('end',resolve)
	});




console.log("\n finished reading xml")

	// final cleanup

	var ids={}
	for(n in tags) { var v=tags[n]
		var name=n.replace("http://aims.fao.org/aos/agrovoc/","")
		if( name.substr(0,2)=="c_" )
		{
			ids[name]=v
		}
	}
	
	var bubble_up=function(url,name,value)
	{
		var map={}
		map[url]=true
		var dirty=true
		while(dirty)
		{
			dirty=false
			for(var n in map)
			{
				var o=resource.all[ url ]
				if(o)
				{
					for(i=0;i<o.length;i++)
					{
						if( !map[o.url] )
						{
							dirty=true
							map[o.url]=o
						}
					}
				}
			}
		}
		
		for(var n in map)
		{
			var v=map[n]
			if(typeof v == "object")
			{
				v[name]=value
			}
		}
		
	}

	for(var resource_name in resource_names ) // copy values upwards
	{
		for(n in tags) { var v=tags[n]
			var o=resource[ resource_name ][ n ]
			if(o)
			{
				for(i=0;i<o.length;i++)
				{
					o[i][resource_name]=o[i][resource_name] || v.any // pick any
					if(v.en) { o[i][resource_name]=v.en } // prefer english
				}
			}
		}
	}

	for(n in tags) { var v=tags[n]
		if(v.label) { bubble_up(n,"label",v.label) }
//				if(v.alt)   { bubble_up(n,"alt",v.alt) }
	}


	for(n in ids) { var v=ids[n]
		delete v.url
		if(v.parents)
		{
			for( np in v.parents){ var vp=v.parents[np] // scan parents
				var it=ids[vp]
				if(it)
				{
					if(!it.children) { it.children=[] } // link to children
					it.children.push(n)
				}
			}
		}
	}




	if(filenameout)
	{
		console.log("writing "+filenameout)
		fs.writeFileSync( filenameout , json_stringify(ids,{ space: ' ' }) )
		write_tsv( filenameout+".tsv" , ids )
	}
	else
	{
		console.log( json_stringify(ids,{ space: ' ' }) )
	}
	
	return stack[0][1];
}
