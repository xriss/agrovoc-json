# agrovoc-json

The [AGROVOC Core RDF data dump](https://aims-fao.atlassian.net/wiki/spaces/AGV/pages/2949126/Releases) is a 34.8mb zip that extracts to 947.6mb XML.

This huge file has been whittled down to a 3.1mb JSON.

We've chosen the English (xl_en) translations except in circumstances where there isn't, we will pick a random language.

# The data

[agrovoc.json](https://github.com/xriss/agrovoc-json/blob/master/json/agrovoc.json) (3.1mb)
[agrovoc.tsv](https://github.com/xriss/agrovoc-json/blob/master/json/agrovoc.tsv) (6.45mb)

# Updates

You can always [download an updated data dump](https://aims-fao.atlassian.net/wiki/spaces/AGV/pages/2949126/Releases) and run the script to create a new JSON and TSV file.

1. Unzip the zip file into the [xml folder](https://github.com/xriss/agrovoc-json/tree/master/xml)
2. Run this script from root ```./agrovoc-json import xml/core.rdf json/agrovoc.json```
3. Replace *core.rdf* and *agrovoc.json* where neccessary

# Dependencies

If you wish to run the script, you'll need to run this script from root to install the node packages.

```npm install```

# Links to node packages

**[yargs](https://www.npmjs.com/package/yargs)**

**[node-expat](https://www.npmjs.com/package/node-expat)**

**[json-stable-stringify](https://www.npmjs.com/package/json-stable-stringify)**



