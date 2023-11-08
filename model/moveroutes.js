const fs = require('fs');
const SarLocation = require('../model/sarlocation');


class RouteManager {

    constructor() {
        this.files = fs.readdirSync('./public/geojson'),
            this.points = []
    }

    loadAllPoints() {

        console.log('Loading points...');
        const self = this;

        this.files.map((file) => {
            // Read file
            try {
                const data = fs.readFileSync(`./public/geojson/${file}`, 'utf8');
                const jsonObject = JSON.parse(data);

                // Convert jsonObject to SarLocation
                const locations = jsonObject['points'];
                console.log(`Points lenght: ${locations.length}`);

                for (let i = 0; i < locations.length; i++) {
                    const point = locations[i];
                    const lat = point['lat'];
                    const lon = point['lon'];
                    const identifier = point['identifier'];
                    let sarLoc = new SarLocation(lat, lon, identifier);
                    // console.log('loading...');
                    // console.log(sarLoc);
                    self.points.push(sarLoc);
                }

            } catch (err) {
                console.log(`Error: ${err}`);
                console.error(err);
            }
        });
    }

    showPoints() {
        console.log('Show points...');
        const self = this;
        console.log(`Files: ${this.files.length}`);
        console.log(`Points loaded ${this.points.length}`);
        this.points.map((point) => {
            console.log(point.toString());
        });
    }

    getBestRoute(origin, dest) {
        //this.loadAllPoints();

        // console.log(`Points: ${this.points.length}`);

        let distance = 8e10;
        let identifier = null;

        // console.log(`Data entry{ O:${origin.toString()}, D:${dest.toString()}}`);
        // console.log(`Init Distance: ${distance}`);

        this.points.forEach((sarLoc) => {
            const dFromOr = sarLoc.distanceTo(origin);
            const dFromDest = sarLoc.distanceTo(dest);
            const tmp = (dFromOr + dFromDest) / 2;
            
            // console.log(`D from O: ${dFromOr} D from D: ${dFromDest}`);
            // console.log(`Tmp value: ${tmp}`);

            if (tmp < distance){
                distance = tmp;
                identifier = sarLoc.routeIdentifier;
            }
        });

        if (distance <= 80e10){
            console.log(`Best route: ${identifier}`);
            return identifier;
        } else {
            return null;
        }
    }
}



module.exports = RouteManager;