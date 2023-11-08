const routeInf = require('../config/routesinf');
const SarLocation = require('../model/sarlocation');
const fs = require('fs');

const getBestRoute = async (req, res) => {
    try {
        const {lato, lono, latd, lond} = req.body;

        const origin = new SarLocation(lato, lono);
        const dest = new SarLocation(latd, lond);
    
        const routeId = routeInf.getBestRoute(origin, dest);


        const data = fs.readFileSync(`./public/geojson/${routeId}.json`);
        const jsonObject = JSON.parse(data);
        res.status(200).json(jsonObject);

    } catch(err) {
        res.status(500).json({'error': 'Server error'});
        console.log(`Error: ${err}`);
    }
};

module.exports = {
    getBestRoute,
}