#!/usr/bin/env node

var fs = require('fs');
var argv = require('minimist')(process.argv.slice(2));
var linebyline = require('linebyline');
var spawn = require("child_process").spawn;
var queryOverpass = require('./query-overpass');
var queryWikidata = require('./query-wikidata');
var json2csv = require('json2csv');
var input = linebyline(__dirname + '/' + argv.file);
var d3 = require('d3-queue');
var q = d3.queue(1);

input.on('line', function (line, lineCount) {
  var line = line.split(',');
  var name = line[0], 
  x = Number(line[1]),
  y = Number(line[2]),
  wikidata = line[3],
  radius = Number(line[4]),
  threshold = Number(line[5]);
  q.defer(getData, name, x, y, wikidata, radius, threshold);
});

input.on('end', function (err) {
    q.awaitAll(function (err, results) {
      if (err) throw err;
      var finalArray = [];
      for (var i = 0; i < results.length; i++) {
          var resultArray = JSON.parse(results[i]);
          finalArray = finalArray.concat(resultArray);
      }
      var fields = ['distance', 'score', 'osm_name', 'placeLabel', 'place', 'location', 'osm_id'];
      var csv = json2csv({ data: finalArray, fields: fields });
      fs.writeFile('output.csv', csv, function(err) {
        if (err) throw err;
        console.log('file saved');
      });
    });
});

input.on('error', function(error) {
  console.log(error);
});

function getData(name, x, y, wikidata, radius, threshold, callback) {

    // console.log('getData', name);
    // overpass
    var osmData;
    var wikiData;
    queryOverpass(x, y, radius, function (err, d) {
        if (err) {
            console.log(err);
        }
        osmData = d;

        fs.writeFile(name + '_osm.csv', osmData, function (err) {
            if (err) {
                return console.log(err);
            }
        });

        // wikidata
        queryWikidata(wikidata, radius, function (err, d) {
            if (err) console.log(err);
            wikiData = d;

            fs.writeFile(name + '_wiki.csv', wikiData, function (err) {
                if (err) {
                    return console.log(err);
                }
            });

        // then match
        var command = spawn('python', [__dirname + '/match.py', __dirname + '/' + name + '_osm.csv', __dirname + '/' + name + '_wiki.csv', threshold]);
        var result = '';
            command.stdout.on('data', function (data) {
                result += data.toString();
            });
            command.on('close', function (code) {
                fs.unlinkSync(__dirname + '/' + name + '_osm.csv');
                fs.unlinkSync(__dirname + '/' + name + '_wiki.csv');
                callback(null, result);
            });

        });
    });
}
