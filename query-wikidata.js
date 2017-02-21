var wdk = require('wikidata-sdk');
var request = require('request');
var json2csv = require('json2csv');
var fields = ['wikidata_url', 'wikidata_qid', 'place_label', 'location'];
var uniqBy = require('lodash.uniqby');

function queryWikidata(callback) {

  var sparql = `
  #defaultView:Map
  #defaultView:BubbleChart
  SELECT DISTINCT ?place ?placeLabel ?location
  WHERE 
  {
    ?place wdt:P31* wd:Q515 .
    ?place wdt:P625 ?location .
     SERVICE wikibase:label {
        bd:serviceParam wikibase:language "en" . 
      }
  }
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
          bindings[count]['wikidata_url'] = binding['place']['value'];
          bindings[count]['wikidata_qid'] = binding['place']['value'].split('entity/')[1];
          bindings[count]['place_label'] = binding['placeLabel']['value'];
          bindings[count]['location'] = binding['location']['value'];
          count += 1;
        });
        var uniqueBindings = uniqBy(bindings, 'place');
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