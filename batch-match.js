#!/usr/bin/env node

var fs = require('fs');
var argv = require('minimist')(process.argv.slice(2));
var linebyline = require('linebyline');
var spawn = require("child_process").spawn;
var queryOverpass = require('./query-overpass');
var queryWikidata = require('./query-wikidata');
var input = linebyline(__dirname + '/' + argv.file);
var d3 = require('d3-queue');
var q = d3.queue(1);

input.on('line', function (line, lineCount) {
  var line = line.split(',');
  var name = line[0], 
  x = Number(line[1]),
  y = Number(line[2]),
  wikidata = line[3],
  radius = Number(line[4]);
  console.log(name);
  q.defer(getData, name, x, y, wikidata, radius);
});

input.on('end', function (err) {
    q.awaitAll(function (err, results) {
      if (err) throw err;

      console.log(results);
    });
});

input.on('error', function(error) {
  console.log(error);
});

function getData(name, x, y, wikidata, radius, callback) {

  console.log('getData', name);
  // overpass
  var osmData;
  var wikiData;
  queryOverpass(x, y, radius, function (err, d) {
    if (err) {
        console.log(err);
    };
    osmData = d;

    // wikidata
    queryWikidata(wikidata, radius, function (err, d) {
      if (err) console.log(err);
      wikiData = d;
      callback(null, [osmData.length, wikiData.length]);
      // then match
      var match = spawn('python',[__dirname + '/match.py', arg1, arg2, ...]);
    });
  });

}