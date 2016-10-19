var debug = require('debug');
var info = debug('aqua:database');

/**
 * Database
 */
var Sequelize = require('Sequelize')
var db = require('../database');

/**
 * Defining
 */
var user = db.define('user', {
    username: {
        type: Sequelize.STRING
    },
    password: {
        type: Sequelize.STRING
    },
    firstname: {
        type: Sequelize.STRING
    },
    githubname: {
        type: Sequelize.STRING
    }
});

/**
 * Relationships
 */

/**
 * Synchronise
 */
user.sync().then(function () {
    info('User sync completed')
});

module.exports = user;