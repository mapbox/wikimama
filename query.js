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
            return callback('wiki error', null);
        }
        var wikiData = d;
        fs.writeFile(name + '_wiki.csv', wikiData, function (err) {
            if (err) {
                return callback('wiki file write error', null);
            }
        });
    });
} else if (module === "overpass") {
    var x = Number(process.argv[4]);
    var y = Number(process.argv[5]);
    var radius = Number(process.argv[6]);

    queryOverpass(x, y, radius, function (err, d) {
        if (err) {
            return callback('overpass error', null);
        }
        var osmData = d;

        fs.writeFile(name + '_osm.csv', osmData, function (err) {
            if (err) {
                return callback('osm file write error', null);
            }
        });
    });
}
