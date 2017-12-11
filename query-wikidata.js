var wdk = require('wikidata-sdk');
var request = require('request');
var json2csv = require('json2csv');
var fields = ['wikidata_url', 'wikidata_qid', 'place_label', 'location', 'instance', 'iid'];
var uniqBy = require('lodash.uniqby');

function queryWikidata(callback) {

  var sparql = `
  SELECT ?item ?itemLabel ?instance_of ?instance_ofLabel ?coordinate_location WHERE {
    SERVICE wikibase:label { bd:serviceParam wikibase:language "ru". }
    ?item (wdt:P31/wdt:P279*) wd:Q486972.
    OPTIONAL { ?item wdt:P31 ?instance_of. }
    OPTIONAL { ?item wdt:P625 ?coordinate_location. }
    ?item wdt:P17 wd:Q159.
  }
  LIMIT 500
  `;

  var url = wdk.sparqlQuery(sparql);
  request(url, function (err, response) {
    if (err) {
      console.log(err);
    } else {
      var body = JSON.parse(response.body);
      try {
        var bindings = body['results']['bindings'];
        var count = 0;
        bindings.forEach(function (binding) {
          bindings[count]['wikidata_url'] = binding['item']['value'];
          bindings[count]['wikidata_qid'] = binding['item']['value'].split('entity/')[1];
          bindings[count]['place_label'] = binding['itemLabel']['value'];
          bindings[count]['location'] = binding['coordinate_location']['value'];
          bindings[count]['iid'] = binding['instance_of']['value'];
          bindings[count]['instance'] = binding['instance_ofLabel']['value'];
          count += 1;
        });
        var uniqueBindings = uniqBy(bindings, 'item');
        var result = json2csv({data: uniqueBindings, fields: fields});
        callback(null, result);
      } catch (err) {
            // Errors are thrown for bad options, or if the data is empty and no fields are provided.
            // Be sure to provide fields if it is possible that your data array will be empty.
            callback(err, null);
          }
        }
      });
}

module.exports = queryWikidata;