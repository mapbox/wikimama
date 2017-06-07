#!/bin/bash

FILENAME=$1
radius=200

cat $FILENAME | while read LINE

do
    count=0
    name=$(echo $LINE | cut -d',' -f1)
    lon=$(echo $LINE | cut -d',' -f2)
    lat=$(echo $LINE | cut -d',' -f3)
    node query.js --module=wikidata --name "$name" --lon=$lon --lat=$lat --radius=$radius

done