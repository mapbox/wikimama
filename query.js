var queryWikidata = require('./query-wikidata');
var queryOverpass = require('./query-overpass');
var fs = require('fs');
var module = process.argv[2];

if (module === "wikidata") {
    queryWikidata(function (err, d) {
        if (err) {
            console.log('wiki error');
        }
        var wikiData = d;
        fs.writeFile('wiki.csv', wikiData, function (err) {
            if (err) {
                console.log('wiki file write error');
            }
        });
    });
} else if (module === "overpass") {
    queryOverpass(function (err, d) {
        if (err) {
            console.log('overpass error');
        }
        var osmData = d;
        fs.writeFile('osm.csv', osmData, function (err) {
            if (err) {
                console.log('osm file write error');
            }
        });
    });
}
