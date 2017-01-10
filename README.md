# OSM <-> Wikidata matching

This repo contains scripts to aid in manually matching OSM IDs to Wikidata IDs.

### Requirement
Node version >= 6

### Setup

1. `npm link`
2. `pip install -r requirements.txt`
3. `match-wikidata-osm --file input.csv`

#### batch-match.js

batch-match.js takes a CSV of places and queries Overpass for OSM features, then Wikidata for neighboring entities, runs a match based on geographic distance and levenshtein distance. It finally writes the possible matches into a CSV for manual verification.

`node batch-match.js --file input.csv`

batch-match.js uses the following pieces:

#### query-overpass.js

Queries Overpass for OSM features around a particular coordinate. See query.ql for the query. Radius is in kilometers. Returns results as CSV.

#### query-wikidata.js

Queries Wikidata for features around a particular Wikidata entity defined by a radius. 


#### match.py

Take OSM features and wikidata features and uses distance as well as fuzzy name matching to predict potential matches and generates a CSV for manual review.
