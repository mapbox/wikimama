# OSM <-> Wikidata matching

This repo contains scripts to aid in manually matching OSM IDs to Wikidata IDs.

### Requirement
Node version >= 6

If you have an older version of node, check the available versions using `nvm ls`. If higher version of nvm is not available, install version greater than 6 by `nvm install 6`. Then do `nvm use 6` to switch node version to greater than 6.

### Setup

Create a `input.csv`  with just the *threshold distance* using any of the text editors. Open the `wikimama` folder in *terminal*. Then runt the following commands:

1. `npm install`
2. `npm link`
3. `pip install -r requirements.txt`
4. `node batch-match.js --file input.csv`

The script would start processing the lists and would generate `output.csv`

#### batch-match.js

batch-match.js looks for `cities_osm.geojson`. If not found generates a CSV of cities by querying OSM through overpass query and queries Wikidata for cities using SPARQL query. It runs a match based on geographic distance and levenshtein distance. It finally writes the possible matches into a CSV for manual verification.`

**Threshold distance**: Maximum distance around osm feature which needs to be looked for potential wikidata matches. For example, when looking for a match for a neighbourhood, this value could go low upto 2 km. But when looking for a match for a country or so, this value can go high upto 100 km. The suggested value for cities is 50 km.

Modify the `input.csv` with the required threshold value. By default it has been set to 50km for cities.



batch-match.js uses the following pieces:

#### query-overpass.js

Queries Overpass for OSM features (cities) around a particular coordinate. See query.ql for the query. Returns results as CSV.

#### query-wikidata.js

Queries Wikidata for features which are instance of a city.


#### match.py

Take OSM features and wikidata features and uses distance as well as fuzzy name matching to predict potential matches and generates a CSV for manual review.

One can also use the above three scripts in a standalone manner.

