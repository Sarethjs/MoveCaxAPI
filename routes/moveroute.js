const express = require('express');
const moveRouteController = require('../controllers/moveroutes');
const router = express.Router();

router.post('/', moveRouteController.getBestRoute);


module.exports = router;