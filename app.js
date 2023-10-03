const express = require('express');
const app = express();


// Importing routers
const userRouter = require('./routes/user');

app.use(express.json());

// Routers
app.use('/users', userRouter);

module.exports = app;