const User  = require('../model/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
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
        }
        
        // Compare password
        const passIsCorrect = await bcrypt.compare(password, user.password);

        if (!passIsCorrect){
            res.status(401).json({'error': 'Contraseña incorrecta'});
        }
        
        // Create token
        const token = jwt.sign(
            {userId: user.id, email: user.email}, process.env.TOKEN_KEY,
            {
                expiresIn: '1m' // Two months
            }
        );
        
        // Save and update Token
        user.token = token;
        await user.save();
        
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
const updateUser = async (req, res) => {

    const {email, password, newPassword} = req.body;

    try {
        
        const user = await User.findOne({
            where: {email: email}
        });

        // Verify password
        const passIsCorrect = await bcrypt.compare(password, user.password);

        if (!passIsCorrect) {
            res.status(401).json({'error': 'Contraseña incorrecta'});
        }

        // Update user
        user.password = password;
        await user.save();

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

        res.status(200).json(user);

    } catch(error) {
        console.log(`Error: ${error}`);
        console.error(error);
        res.status(500).json({'error': 'Server error'});
    }



}


module.exports = {
    createUser,
    loginUser,
    updateUser,
    findUser
}
