-- Add a geometry column to the osm table
ALTER TABLE osm ADD COLUMN the_geom geometry;

-- Set the geometry column to Points derived from lon and lat fields
UPDATE osm SET the_geom=ST_SetSRID(ST_MakePoint(lon, lat),4326);

-- Transform SRID of `osm` table to 900913 to match wikidata table
ALTER TABLE osm ALTER COLUMN the_geom TYPE geometry(Point,900913) USING ST_Transform(the_geom,900913);

-- Create index of wikidata names for faster lookups
CREATE INDEX wikidata_label_en_btree ON mb_wikidata(label_en);

-- Create a column to hold the "canonical name" of the OSM feature
ALTER TABLE osm ADD COLUMN canonical_name text;

-- Set canonical name to the name field where name_en does not exist
UPDATE osm SET canonical_name=name where name_en is null;

-- Set canonical name to name_en where name_en exists
UPDATE osm SET canonical_name=name_en WHERE name_en IS NOT NULL;

-- Create index on canonical_name column:
CREATE INDEX osm_canonical_name_btree ON osm (canonical_name);


