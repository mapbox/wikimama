/*
Queries Overpass for OSM features. See query.ql for the query. Radius is in kilometers. Returns results as CSV.
*/

var overpass = require('query-overpass');
var fs = require('fs');
var util = require('util');
var turf = require('turf');
var json2csv = require('json2csv');
var argv = require('minimist')(process.argv.slice(2));

function queryOverpass(callback) {
  // overpass(query, function(error, data) {
  //   if (error) {
  //     console.log(error);
  //     return callback(error, null);
  //   };
      var data = fs.readFileSync(__dirname + '/cities_osm.geojson').toString();
      data = JSON.parse(data);
      // ::id,::lon,::lat,"place","name","name:en","name:zh","wikipedia","wikidata"
      var d = [];
      data.features.forEach(function (f) {
        var id_type = f.id.split('/');
        var interestedProps = {
          'id': id_type[1],
          'type': id_type[0],
          'lon': f.geometry.coordinates[0],
          'lat': f.geometry.coordinates[1],
          'place': f.properties.hasOwnProperty('place') ? f.properties.place : '',
          'name': f.properties.hasOwnProperty('name') ? f.properties.name : '',
          'name:en': f.properties.hasOwnProperty('name:en') ? f.properties['name:en'] : '',
          'name:zh': f.properties.hasOwnProperty('name:zh') ? f.properties['name:zh'] : '',
          'wikipedia': f.properties.hasOwnProperty('wikipedia') ? f.properties.wikipedia : '',
          'wikidata': f.properties.hasOwnProperty('wikidata') ? f.properties.wikidata : ''
        }
        d.push(interestedProps);
      });

      callback(null, json2csv({'data': d, 'fields': ['id', 'type', 'lon', 'lat', 'place', 'name', 'name:en', 'name:zh', 'wikipedia', 'wikidata']}));

    // }, {'overpassUrl': 'http://overpass-cfn-production.tilestream.net/api/interpreter'});
}

  module.exports = queryOverpass;