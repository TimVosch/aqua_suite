var debug = require('debug');
var info = debug('aqua:database');

/**
 * Database
 */
var Sequelize = require('sequelize');
var db = require('../database');

/**
 * Defining
 */
var user = db.define('user', {
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
