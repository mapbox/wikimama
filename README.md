# OSM <-> Wikidata matching

This repo contains scripts to aid in manually matching OSM IDs to Wikidata IDs. See https://wiki.openstreetmap.org/wiki/Wikidata for details.

### Setup

Use node version >= 6

- `npm link`
- `pip install -r requirements.txt`
- `match-wikidata-osm --file input.csv`

#### batch-match.js

batch-match.js takes a CSV of places and queries Overpass for OSM features, then Wikidata for neighboring entities, runs a match based on geographic distance and levenshtein distance. It finally writes the possible matches into a CSV for manual verification.

`node batch-match.js --file input.csv`


`input.csv` is expected in this format:

`City, longitude, latitude, wikidata_id, radius, threshold distance`

**City**: name of the city for which the neighbourhoods around it are looked for

**Longitude**: Longitude value at the centre of the city

**Latitude**: Latitude value at the centre of the city

**wikidata_id**: Wikidata id of the city

**Radius**: Distance to query from the centre of the city

**Threshold distance**: Maximum distance around osm feature which needs to be looked for potential wikidata matches. For example, when looking for a match for a neighbourhood, this value could go low upto 2 km. But when looking for a match for a country or so, this value can go high upto 500 km.

*Note*: See an [example](https://github.com/mapbox/wikimama/blob/master/test/fixture.csv) input file under test folder. 



batch-match.js uses the following pieces:

#### query-overpass.js

Queries Overpass for OSM features around a particular coordinate. See query.ql for the query. Radius is in kilometers. Returns results as CSV.

#### query-wikidata.js

Queries Wikidata for features around a particular Wikidata entity defined by a radius. 


#### match.py

Take OSM features and wikidata features and uses distance as well as fuzzy name matching to predict potential matches and generates a CSV for manual review.

One can also use the above three scripts in a standalone manner.

#### query.js

For querying wikidata, use the following command.  It will generate city_name_wiki.csv.

`node query.js wikidata city_name wikidata_id radius`

For querying overpass, use the following command.  It will generate city_name_osm.csv.

`node query.js overpass city_name longitude latitude radius`

For creating match between osm csv and wiki csv, use the following command.

`python match.py osmCSV wikiCSV Threshold distance`

