const express = require('express');
const app = express();


// Importing routers
const userRouter = require('./routes/user');
const routeRouter = require('./routes/moveroute');
const routerApp = require('./routes/cax');

// View engine
app.set('view engine', 'ejs');
app.set('views', __dirname + '/public/views');

// Static folder
app.use(express.static('public'));

app.use(express.json());

// Routers
app.use('/users', userRouter);
app.use('/routes', routeRouter);
app.use('/app', routerApp);


module.exports = app;