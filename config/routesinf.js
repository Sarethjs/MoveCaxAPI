const RouteManager = require('../model/moveroutes');
const rManager = new RouteManager();
rManager.loadAllPoints();

module.exports = rManager;