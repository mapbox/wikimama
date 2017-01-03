# Uses SQL to find potential Wikidata matches to OSM features.

## Import the Wikidata dump

Create a postgres database
```
createdb wikidata
psql -d wikidata
```

Add postgis extension inside the psql prompt
```
create extension postgis;
\q;
```

Import the postgres dump of the wikidata db, got from s3:

`pg_restore -d wikidata -Fc wikidata.dump`

## Import the OSM features to match

Run script to create table to hold OSM data:

`psql -d wikidata -f create_table.sql`

Import OSM data that you wish to match:

`psql -d wikidata`

`COPY osm FROM '/full/path/to/file.csv' CSV DELIMITER ',' HEADER;`

The OSM CSV file should contain columns as such: osm_id, qid, type, name, name_en, lon, lat.


## Match the OSM features to Wikidata
Prepare tables - this runs some geometry transformations, creates indexes, etc.:

`psql -d wikidata -f prepare_tables.sql`

Create a fresh table with OSM <-> Wikidata matches:

`psql -d wikidata -f run_matching.sql`

Output this created table as CSV:

`psql -d wikidata`  
`COPY exact_matches_canonical_name TO '<full/output/path/filename.csv>' CSV HEADER;`

Once we have this output CSV, we can run the scripts in the `js` folder to augment it with additional data from `wikidata` using the API. Look at the README in the `js` folder for further instructions.

