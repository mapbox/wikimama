var csv2json = require('csv2json');
var fs = require('fs');
var queue = require('d3-queue').queue;
var csvWriter = require('csv-write-stream');
var fields = [
    'osm_id',
    'osm_type',
    'qid',
    'JOSM',
    'wikidata',
    'match_type',
    'wd_distance',
    'mb_score',
    'admin',
    'name',
    'name_en',
    'label_en',
    'label_zh',
    'wd_instance_of',
    'description',
    'enwiki_link'
];
var argv = require('minimist')(process.argv.slice(2));
var inputCsv = argv._[0];
var outputCsv = argv._[1];
var writer = csvWriter({headers: fields});
var request = require('request');
writer.pipe(fs.createWriteStream(outputCsv));
var q = queue(5);
var _ = require('lodash');

var instanceOfMapping = require('./WD_instance_of.json').reduce(function(memo, val, index) {
    var id = val.QID;
    memo[id] = val.Label;
    return memo;
}, {});

console.log('instance of mapping', instanceOfMapping);

writer.write(fields);

(function() {
fs.createReadStream(inputCsv)
    .pipe(csv2json())
    .on('data', function(data) {
        var s = data.toString('utf-8');
        if (s.trim().length < 5) return;
        // obj = JSON.parse(obj.toString('utf-8'));
        // console.log(s);
        var data = JSON.parse(s);
        q.defer(fetchWikidata, data);
        // console.log(data);
    })
    .on('end', function() {
        console.log('read stream ended');
        q.awaitAll(function(err, results) {
            if (err) throw err;
            results.forEach(function(r) {
                r.isDuplicate = hasDuplicate(r, results);
            });
            results = _.chain(results)
                .sortBy('distance')
                .sortBy('name_en')
                .value();
            results.forEach(function(r) {
                console.log('writing row', r);
                writeRow(r);
            });
            writer.end();
        });
    });
})();

function writeRow(data) {
    var arr = [
        data.osm_id,
        data.osm_type,
        data.qid,
        data.JOSM,
        data.wikidataURL,
        data.isDuplicate ? 'duplicate' : 'exact',
        data.distance,
        data.score,
        data.admin,
        data.name,
        data.name_en,
        data.label_en,
        data.label_zh,
        data.instanceOf,
        data.description,
        data.enwikiLink
    ];
    writer.write(arr);
}

function fetchWikidata(data, callback) {
    // console.log("I AM HERE");
    var qid = data.qid;
    var url = `https://www.wikidata.org/wiki/Special:EntityData/${qid}.json`;
    request(url, function(err, response) {
        if (err) {
            console.log("ERROR FETCHING", data.qid);
            return fetchWikidata(data, callback);
        }
        var wikiData = JSON.parse(response.body);
        // console.log('wikidata', wikiData);
        // writer.write(wikiData);
        var augmentedData = getAugmentedData(qid, data, wikiData);
        // if (writer.write(augmentedData)) {
        //     return callback();
        // } else {
        //     writer.once('drain', callback);
        // }
        // console.log(JSON.stringify(augmentedData, null, 2));
        callback(null, augmentedData);
    });
}

function hasDuplicate(item, all) {
    var osmId = item.osm_id;
    var wikiId = item.qid;
    var hasDupe = false;
    for (var i=0; i < all.length; i++) {
        if (all[i].osm_id === osmId && all[i].qid !== wikiId) {
            return true;
        } 
    }
    return false;
}

function getAugmentedData(qid, base, extra) {
    base.description = getWikidataDescription(qid, extra);
    base.enwikiLink = getWikidataLinks(qid, extra);
    base.distance = Math.round(base.distance / 1000);
    base.wikidataURL = 'https://wikidata.org/wiki/' + qid;
    base.JOSM = getJOSMLink(qid, base);
    base.instanceOf = getInstanceOf(qid, extra); 
    return base;
}

function getWikidataDescription(qid, data) {
    console.log('data', JSON.stringify(data, null, 2));
    if (data && data.entities && data.entities[qid] && 
        data.entities[qid].descriptions &&
        data.entities[qid].descriptions.en &&
        data.entities[qid].descriptions.en.value) {
        return data.entities[qid].descriptions.en.value;
    } else {
        return null;
    }
}

function getInstanceOf(qid, data) {
    if (data && data.entities && data.entities[qid] &&
        data.entities[qid].claims && data.entities[qid].claims.P31) {
        var claims = data.entities[qid].claims.P31;
        var claimIds = claims.map(function(c) {
            return c.mainsnak.datavalue.value.id;
        });
        // console.log('claim ids', claimIds);
        for (var i=0; i<claimIds.length; i++) {
            if (instanceOfMapping.hasOwnProperty(claimIds[i])) {
                return instanceOfMapping[claimIds[i]];
            }
        }
        return null;
        // console.log('claim', claim);
        // var instanceOfId = claim.mainsnak.datavalue.value.id;
        // // console.log('instance of id', instanceOfId);
        // if (instanceOfMapping.hasOwnProperty(instanceOfId)) {
        //     return instanceOfMapping[instanceOfId];
        // } else {
        //     return null;
        // }
    } else {
        // console.log('instance of not found');
        return null;
    }
}

function getWikidataLinks(qid, data) {
    if (data && data.entities && data.entities[qid] &&
        data.entities[qid].sitelinks && data.entities[qid].sitelinks.en) {
        return data.entities[qid].sitelinks.en.url;
    } else {
        return null;
    }
}

function getJOSMLink(qid, osmData) {
    return 'http://localhost:8111/load_object?new_layer=true&objects=n' + osmData.osm_id + '&addtags=wikidata=' + qid;
}