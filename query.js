var queryWikidata = require('./query-wikidata');
var queryOverpass = require('./query-overpass');
var fs = require('fs');
var argv = require('minimist')(process.argv.slice(2));

var module = argv.module;
var name = argv.name;

if (module === "wikidata") {
    var lon = argv.lon;
    var lat = argv.lat;
    var radius = argv.radius;
    queryWikidata(lon, lat, radius, function (err, d) {
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
    var x = Number(argv.x);
    var y = Number(argv.y);
    var radius = Number(argv.radius);

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
