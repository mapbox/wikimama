#!/usr/bin/env node

var fs = require('fs');
var argv = require('minimist')(process.argv.slice(2));
var linebyline = require('linebyline');
var queryOverpass = require('./query-overpass');
var input = linebyline(__dirname + '/' + argv.file);
input.on('line', function (line, lineCount) {
    var line = line.split(',');
    var name = line[0], 
        x = Number(line[1]),
        y = Number(line[2]),
        wikidata = line[3],
        radius = Number(line[4]);
        queryOverpass(x, y, radius, function (err, d) {
            if (err) {
                console.log(err);
            };
            // overpass results.
            console.log(d);

            // next run wikidata.
            // then match
        });
});

input.on('error', function(error) {
    console.log(error);
});

