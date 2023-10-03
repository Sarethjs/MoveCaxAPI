const {DataTypes, Model} = require('sequelize');
const sequelize = require('../config/database');


class User extends Model{}

User.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    names: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    lastnames: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
    },

    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    dateBorn: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },

    sex: {
        type: DataTypes.CHAR,
        allowNull: false,
    },

    token: {
        type: DataTypes.STRING
    }

}, {
    sequelize,
    timestamps: true,
    tableName: 'users'
});


module.exports = User;