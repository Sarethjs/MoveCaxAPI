const routeInf = require('../config/routesinf');
const SarLocation = require('../model/sarlocation');
const fs = require('fs');

const getBestRoute = async (req, res) => {
    try {
        const lato = parseFloat(req.query.lato);
        const lono = parseFloat(req.query.lono);

        const latd = parseFloat(req.query.latd);
        const lond = parseFloat(req.query.lond);

        const origin = new SarLocation(lato, lono);
        const dest = new SarLocation(latd, lond);
    
        const routeId = routeInf.getBestRoute(origin, dest);


        // Setting headers
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Dispositon', 'attachment; file="best_route.json');

        const fileStream = fs.createReadStream(`./public/geojson/${routeId}.json`);
        fileStream.pipe(res);


        fileStream.pipe(res);

    } catch(err) {
        res.status(500).json({'error': 'Server error'});
        console.log(`Error: ${err}`);
        console.error(err);
    }
};

module.exports = {
    getBestRoute,
}