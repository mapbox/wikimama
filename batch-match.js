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
var q = d3.queue(2);

input.on('line', function (line, lineCount) {
  var threshold = Number(line.trim());
  q.defer(getData, threshold);
});

input.on('end', function (err) {
    q.awaitAll(function (err, results) {
      if (err) console.log(err);
      var fields = ['distance', 'score', 'osm_name', 'place_label', 'wikidata_qid', 'wikidata_url', 'josm_url', 'location', 'osm_id', 'osm_type', 'place'];
      var csv = json2csv({ data: results[0], fields: fields });
      fs.writeFile('output.csv', csv, function(err) {
        if (err) throw err;
        console.log('file saved');
      });
    });
});

input.on('error', function(error) {
  console.log('input error', error);
});

function getData(threshold, callback) {

    // console.log('getData', name);
    // overpass
    var osmData;
    var wikiData;
    queryOverpass(function (err, d) {
        if (err) {
            return callback('overpass error', null);
        }
        osmData = d;

        fs.writeFile('osm.csv', osmData, function (err) {
            if (err) {
                return callback('osm file write error', null);
            }
        });

        // wikidata
        queryWikidata(function (err, d) {
            if (err) {
                return callback('wiki error', null);
            }
            wikiData = d;

            fs.writeFile('wiki.csv', wikiData, function (err) {
                if (err) {
                    return callback('wiki file write error', null);
                }
            });

        // then match
        var command = spawn('python', [__dirname + '/match.py', __dirname + '/' + 'osm.csv', __dirname + '/' + 'wiki.csv', threshold]);
        var result = '';
            command.stdout.on('data', function (data) {
                result += data.toString();
            });
            command.stderr.on('data', function (trace) {
              process.stderr.write(trace.toString());
            });
            command.on('close', function (code) {
                if (code !== 0) {
                  return callback('matching script exited', null);
                }
                // dont remove temp files for now
                // fs.unlinkSync(__dirname + '/' + name + '_osm.csv');
                // fs.unlinkSync(__dirname + '/' + name + '_wiki.csv');
                result = JSON.parse(result);
                callback(null, result);
            });

        });
    });
}
