import json
import csv
import numpy as np
import geojson
import shapely.wkt
import shapely.geometry
from geopy.distance import vincenty
import sys
# reload(sys)
import ast
sys.setdefaultencoding('utf-8')
from fuzzywuzzy import process
threshold = 6172

def csv_to_json(csv_file, json_file):
    fr = open(csv_file, 'r')
    fw = open(json_file, 'w')

    line = fr.readline()
    fieldnames = line.split(',')

    count = 0
    for field in fieldnames:
        fieldnames[count] = fieldnames[count].rstrip()
        fieldnames[count] = fieldnames[count].split('"')[1]
        count += 1

    reader = csv.DictReader( fr, fieldnames)
    for row in reader:
        json.dump(row, fw)
        fw.write('\n')

    fr.close()
    fw.close()

csv_to_json('overpass.csv', 'osm.json')
csv_to_json('wiki.csv', 'wiki.json')

fr_osm = open('osm.json','r')

fw = open('output.csv','w')
csvwriter = csv.writer(fw)
fieldnames = ['score','osm_name', 'osm_id', 'distance','placeLabel','place', 'location']
csvwriter.writerow(fieldnames)

count = 0

for osm_line in fr_osm:
    count += 1
    osm_l = json.loads(osm_line)
    wiki_arr = []
    choices = []
    mapping = {}
    final = []
    if osm_l['wikidata'] == "":
        fr_wiki = open('wiki.json','r')
        for wiki_line in fr_wiki:
            wiki_l = json.loads(wiki_line)
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
        fr_wiki.close()
        print mapping
        name = ""
        if 'name:en' in osm_l and osm_l['name:en'] != "":
            scored = process.extract(osm_l['name:en'], choices, limit=5)
            print osm_l['name:en']
            name = osm_l['name:en']
        elif 'name' in osm_l and osm_l['name'] != "":
            scored = process.extract(osm_l['name'], choices, limit=5)
            print osm_l['name']
            name = osm_l['name']
        if len(scored) > 0:
            for score in scored:
                for entry in mapping[score[0]]:
                    entry['score'] = score[1]
                    entry['osm_name'] = name
                    entry['osm_id'] = osm_l['id']
                    obj = []
                    for key in fieldnames:
                        try:
                            obj.append(entry[key])
                        except:
                            obj.append("")
                    print entry
                    csvwriter.writerow(obj)

                final.extend(mapping[score[0]])
    a = np.array(final)
    _, idx = np.unique(a, return_index=True)
    print a[np.sort(idx)]
fr_osm.close()