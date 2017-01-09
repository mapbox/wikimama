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
  console.log(name);
  q.defer(getData, name, x, y, wikidata, radius, threshold);
});

input.on('end', function (err) {
    q.awaitAll(function (err, results) {
      if (err) throw err;
      // array of array of objects
      // 
      for (var i = 0 ; i < results.length; i++) {
        var resultArray = JSON.parse(JSON.stringify(results[i]));
        console.log(resultArray);
        // for (var j = 0; j < resultArray.length; j++) {
        //   console.log(resultArray[j] ,'\n');
        // }
      }
    });
});

input.on('error', function(error) {
  console.log(error);
});

function getData(name, x, y, wikidata, radius, threshold, callback) {

    console.log('getData', name);
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
