var debug = require('debug');
var info = debug('aqua:database');
var user = require('./user');

/**
 * Database
 */
var Sequelize = require('sequelize');
var db = require('../database');

/**
 * Defining
 */
var userCredentials = db.define('userCredentials', {
    password: {
        type: Sequelize.STRING
    },
});

/**
 * Relationships
 */
userCredentials.belongsTo(user);
user.hasOne(userCredentials);

/**
 * Synchronise
 */
userCredentials.sync().then(function () {
    info('userCredentials sync completed')
});

module.exports = userCredentials;
