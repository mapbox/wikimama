var queryWikidata = require('./query-wikidata');
var queryOverpass = require('./query-overpass');
var fs = require('fs');

var module = process.argv[2];
var name = process.argv[3];

if (module === "wikidata") {
    var wikidataId = process.argv[4];
    var radius = process.argv[5];
    queryWikidata(wikidataId, radius, function (err, d) {
        if (err) {
            console.log('wiki error');
        }
        var wikiData = d;
        fs.writeFile(name + '_wiki.csv', wikiData, function (err) {
            if (err) {
                console.log('wiki file write error');
            }
        });
    });
} else if (module === "overpass") {
    var x = Number(process.argv[4]);
    var y = Number(process.argv[5]);
    var radius = Number(process.argv[6]);

    queryOverpass(x, y, radius, function (err, d) {
        if (err) {
            console.log('overpass error');
        }
        var osmData = d;

        fs.writeFile(name + '_osm.csv', osmData, function (err) {
            if (err) {
                console.log('osm file write error');
            }
        });
    });
}
