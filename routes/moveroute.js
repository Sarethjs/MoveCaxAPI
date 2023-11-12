const express = require('express');
const moveRouteController = require('../controllers/moveroutes');
const router = express.Router();

router.get('/', moveRouteController.getBestRoute);


module.exports = router;