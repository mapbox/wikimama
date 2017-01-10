var wdk = require('wikidata-sdk');
var request = require('request');
var json2csv = require('json2csv');
var fields = ['place', 'place_label', 'location'];
var uniqBy = require('lodash.uniqby');

function queryWikidata(wikidataId, radius, callback) {

  var sparql = `
  #defaultView:Map
  SELECT ?place ?placeLabel ?location
  WHERE
  {
    hint:Query hint:optimizer "None" .
    # Berlin coordinates
    wd:${wikidataId} wdt:P625 ?singLoc . 
    SERVICE wikibase:around { 
      ?place wdt:P625 ?location . 
      bd:serviceParam wikibase:center ?singLoc . 
      bd:serviceParam wikibase:radius ${radius} . 
    } 
    # Is a human settlement
    ?place wdt:P31/wdt:P279* wd:Q486972 .
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
          bindings[count]['place'] = binding['place']['value'];
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