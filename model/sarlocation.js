const haversine = require('haversine');

class SarLocation {
    constructor (lat, lon, routeIdentifier) {
        this.lat = lat;
        this.lon = lon;
        this.routeIdentifier = routeIdentifier;
    }

    distanceTo(location) { 

        const start = {
            latitude: this.lat,
            longitude: this.lon
        };

        const end = {
            latitude: location.lat,
            longitude: location.lon
        };

        return haversine(start, end, {unit: 'meters'});
    }

    toString() {
        return `SarLocation {lat: ${this.lat}, lon: ${this.lon}, identifier: ${this.routeIdentifier}}`;
    }
}

module.exports = SarLocation;