const fs = require('fs');
const {v4: uuidv4} = require('uuid');
const gpxParser = require('gpxparser');
const SarLocation = require('./model/sarlocation');

const gpxFiles = [
    './public/gpx_files/p13.gpx',
];

function gpxToJson() {

    console.log('Files to parsing...');
    for (let i = 0; i < gpxFiles.length; i++) {
        console.log(`File: ${gpxFiles[0]}`);
    }
    console.log();

    console.log('Parsing...');
    for (let i = 0; i < gpxFiles.length; i++) {
        fs.readFile(gpxFiles[i], 'utf8', (err, data)=> {
            if (!err) {
                dataToJson(data);
            }
            else {
                console.log(`Error: ${err}`);
            }
        });
    }
}

function dataToJson(data) {

    console.log();
    const identifier = uuidv4();
    const targetFile = `./public/geojson/${identifier}.json`;
    console.log(`Saving in ${targetFile}`);

    let gpx = new gpxParser();
    gpx.parse(data);

    const tracks = gpx.tracks;
    let sarLocations = [];

    for (let i = 0; i < tracks.length; i++) {
        let points = tracks[i].points;
        for (let j = 0; j < points.length; j++) {
            let point = points[j];

            let sarLoc = new SarLocation(point.lat, point.lon, identifier);
            sarLocations.push(sarLoc);
            console.log(`${sarLoc.toString()} added`);
        }
    }
    console.log();

    console.log('Parsing to Json...');
    let jsonObject = {
        routeName: null,
        points: []
    };
    for (let i = 0; i < sarLocations.length; i++) {
        let currentLocation = sarLocations[i];
        let sarLocationJson = {
            lat: currentLocation.lat,
            lon: currentLocation.lon,
            identifier: currentLocation.routeIdentifier,
        };
        jsonObject.points.push(sarLocationJson);
    }

    console.log('Writing on file...');
    const jsonContent = JSON.stringify(jsonObject, null, 2);
    fs.writeFile(targetFile, jsonContent, 'utf8', (err) => {
        if (!err) {
            console.log('Data was saved!');
        }
        else {
            console.log('Error...');
        }
    });
}


gpxToJson();