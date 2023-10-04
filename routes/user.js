const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');


// Routes goes here
router.post('/register', userController.createUser);
router.post('/login', userController.loginUser);
router.put('/update', userController.updateUser);
router.post('/find', userController.findUser);
router.post('/logout', userController.logoutUser);

module.exports = router;