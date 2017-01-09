import json
import csv
import numpy as np
import geojson
import shapely.wkt
import shapely.geometry
from geopy.distance import vincenty
import sys
reload(sys)
import ast
sys.setdefaultencoding('utf-8')
from fuzzywuzzy import process

if len(sys.argv) < 4:
    print "Usage command: python match.py osmCSV wikiCSV distanceThreshold"
    sys.exit()

input_osm = sys.argv[1]
input_wiki = sys.argv[2]
threshold = int(sys.argv[3])

def csvReader(csv_file):
    fr = open(csv_file, 'r')
    line = fr.readline()
    fieldnames = line.split(',')

    count = 0
    for field in fieldnames:
        fieldnames[count] = fieldnames[count].rstrip()
        fieldnames[count] = fieldnames[count].split('"')[1]
        count += 1
    reader_file = csv.DictReader( fr, fieldnames)
    return reader_file

reader_osm = csvReader(input_osm)

fieldnames = ['score','osm_name', 'osm_id', 'distance','placeLabel','place', 'location']

count = 0

for osm_l in reader_osm:
    count += 1
    wiki_arr = []
    choices = []
    mapping = {}
    final = []
    if osm_l['wikidata'] == "":
        reader_wiki = csvReader(input_wiki)
        for wiki_l in reader_wiki:
            place = wiki_l['place']
            placeLabel = wiki_l['placeLabel']
            location = wiki_l['location']
            pt = shapely.wkt.loads(location)
            gt = geojson.Feature(geometry=pt, properties={})
            wiki_geojson = shapely.geometry.shape(gt.geometry)
            distance = vincenty((osm_l['lat'],osm_l['lon']),(wiki_geojson.centroid.x, wiki_geojson.centroid.y)).km
            wiki_l["distance"] = distance
            if distance <= threshold:
                wiki_arr.append(wiki_l)
                choices.append(placeLabel)
                if placeLabel in mapping:
                    mapping[placeLabel].append(wiki_l)
                else:
                    mapping[placeLabel] = []
                    mapping[placeLabel].append(wiki_l)
        name = ""
        if 'name:en' in osm_l and osm_l['name:en'] != "":
            osm_l['name:en'] = osm_l['name:en'].decode('utf-8')
            scored = process.extract(osm_l['name:en'], choices, limit=5)
            name = osm_l['name:en']
        elif 'name' in osm_l and osm_l['name'] != "":
            osm_l['name'] = osm_l['name'].decode('utf-8')
            scored = process.extract(osm_l['name'], choices, limit=5)
            name = osm_l['name']
        if len(scored) > 0:
            for score in scored:
                for entry in mapping[score[0]]:
                    entry['score'] = score[1]
                    entry['osm_name'] = name
                    entry['osm_id'] = osm_l['id']

                final.extend(mapping[score[0]])
    if len(final) > 0:
        a = np.array(final)
        _, idx = np.unique(a, return_index=True)
        print a[np.sort(idx)]
fr.close()
