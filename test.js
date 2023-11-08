const RouteManager = require('./model/moveroutes');

const routeManager = new RouteManager();

function test() {
 
    routeManager.loadAllPoints();
    routeManager.showPoints();
}

test();