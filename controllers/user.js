const User  = require('../model/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {v4: uuidv4} = require('uuid');
require('dotenv').config();

const createUser = async (req, res) => {

    const {names, lastnames, email, password, dateBorn, sex} = req.body;

    try {
        // Salt for hash
        const salt = await bcrypt.genSalt();

        // Protect password
        const encryptedPassword = await bcrypt.hash(password, salt);
        
        // Registering new User
        const newUser = await User.create({
            names: names,
            lastnames: lastnames,
            email: email.toLowerCase(),
            password: encryptedPassword,
            dateBorn: dateBorn,
            sex: sex
        });

        res.status(201).json(newUser);

    } catch (error) {
        console.log(`Error: ${error}`);
        console.error(error);
        res.status(500).json({
            'error': 'Error creando usuario'
        });
    }
};


// login
const loginUser = async (req, res) => {

    const {email, password} = req.body;

    try {
        const user = await User.findOne({
            where: {
                email: email
            }
        });

        if (!user){
            res.status(404).json({'error': 'Usuario no existe'});
            return;
        }
        
        // Compare password
        const passIsCorrect = await bcrypt.compare(password, user.password);

        if (!passIsCorrect){
            res.status(401).json({'error': 'Contraseña incorrecta'});
            return;
        }
        
        // Create token
        const token = uuidv4(); 
        
        // Save and update Token
        user.token = token;
        await user.save();
        console.log(`User logged: ${user.email}`);
        res.status(200).json(user);

    } catch (error) {
        console.log(`Error: ${error}`);
        console.error(error);
        res.status(500).json({
            'error': 'Error al iniciar sesión'
        });
    }
};

// Update user
const updatePassword = async (req, res) => {

    const {email, password, newPassword} = req.body;

    console.log(`Trying change password by ${email}`);


    try {
        
        const user = await User.findOne({
            where: {email: email}
        });

        // Verify password
        const passIsCorrect = await bcrypt.compare(password, user.password);

        if (!passIsCorrect) {
            res.status(401).json({'error': 'Contraseña incorrecta'});
            console.log(`Password incorrect for ${email}`);
            return;
        }

        // Encrypt password again
        // Salt for hash
        const salt = await bcrypt.genSalt();

        // Protect password
        const encryptedPassword = await bcrypt.hash(newPassword, salt);

        // Update user
        user.password = encryptedPassword;
        await user.save();
        console.log(`Updated password by: ${user.email}`);
        res.status(200).json(user);

    } catch (error) {
        console.log(`Error: ${error}`);
        console.error(error);
        res.status(500).json({'error': 'Error al actualizar contraseña'});
    }
};

const findUser = async (req, res) => {

    try {
        const {token} = req.body;

        const user = await User.findOne({
            where: {token: token}
        });

        if (!user) {
            throw new Error('Token not valid');
        }

        console.log(`Login by token: ${user.email}`)
        res.status(200).json(user);

    } catch(error) {
        console.log(`Error: ${error}`);
        res.status(500).json({'error': 'Server error'});
    }
}

const logoutUser = async (req, res) => {

    const {email} = req.body;

    try {
        const user = await User.findOne({
            where: {email: email}
        });

        if (!user) {
            res.status(401).json({'error': 'User not found'});
            console.log(`Logout failed to ${email}`);
            return;
        }

        user.token = null;
        await user.save();
        console.log(`Good bye: ${user.email}`)
        res.status(200).json({'message': 'Good bye'});

    } catch (error) {
        console.log(`Error: ${error}`);
        console.error(error);
        res.send(500).json({'error': 'Server error'});
    }
};


module.exports = {
    createUser,
    loginUser,
    updatePassword,
    findUser,
    logoutUser
}
