const express = require('express');
const app = express();


// Importing routers
const userRouter = require('./routes/user');

app.use(express.json());

// Routers
app.use('/users', userRouter);
app.use((req, res, next) => {
    console.log(`Solicitud ${req.method} a ${req.originalUrl} desde ${req.ip} en ${new Date()}`);
    next(); // Continuar con la ejecución de la solicitud
});



module.exports = app;