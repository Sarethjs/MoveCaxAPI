const http = require('http');
const app = require('./app');
const server = http.createServer(app);

const sequelize = require('./config/database');
const User = require('./model/user');

const { API_PORT } = process.env;
const port = 8080;

// Connect to database
User.sync();


// Mapping models

// server listening
server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});