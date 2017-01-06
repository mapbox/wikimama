/*
node query-overpass.js --lonlat 0.0879,51.4904 --radius 10

Queries Overpass for OSM features. See query.ql for the query. Radius is in kilometers.
Exports the results as a CSV to stdout.
*/

var overpass = require('query-overpass');
var fs = require('fs');
var util = require('util');
var turf = require('turf');
var json2csv = require('json2csv');
var argv = require('minimist')(process.argv.slice(2));

function queryOverpass(lon, lat, radius, callback) {

    var query = fs.readFileSync(__dirname + '/query.ql').toString();
    var x = lon;
    var y = lat;
    var point = turf.point([x, y]);
    var buffer = turf.buffer(point, radius, 'kilometers');
    // wsen
    var bbox = turf.bbox(buffer);
    // swne
    var overpassBbox = [bbox[1], bbox[0], bbox[3], bbox[2]].toString();
    var query = util.format(query, overpassBbox, overpassBbox);
    overpass(query, function(error, data) {
        if (error) {
            return callback(error, null);
        };

        // ::id,::lon,::lat,"place","name","name:en","name:zh","wikipedia","wikidata"
        var d = [];
        data.features.forEach(function (f) {
            var interestedProps = {
                'id': f.properties.id,
                'lon': f.geometry.coordinates[0],
                'lat': f.geometry.coordinates[1],
                'place': f.properties.place,
                'name': f.properties.tags.hasOwnProperty('name') ? f.properties.tags.name : '',
                'name:en': f.properties.tags.hasOwnProperty('name:en') ? f.properties.tags['name:en'] : '',
                'name:zh': f.properties.tags.hasOwnProperty('name:zh') ? f.properties.tags['name:zh'] : '',
                'wikipedia': f.properties.tags.hasOwnProperty('wikipedia') ? f.properties.tags.wikipedia : '',
                'wikidata': f.properties.tags.hasOwnProperty('wikidata') ? f.properties.tags.wikidata : ''
            }
            d.push(interestedProps);
        });

        callback(null, json2csv({'data': d, 'fields': ['id', 'lon', 'lat', 'place', 'name', 'name:en', 'name:zh', 'wikipedia', 'wikidata']}));

    }, {'overpassUrl': 'http://overpass-cfn-production.tilestream.net/api/interpreter'});
}

module.exports = queryOverpass;