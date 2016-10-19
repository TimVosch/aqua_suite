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
var account = db.define('account', {
    username: {
        type: Sequelize.STRING
    },
    password: {
        type: Sequelize.STRING
    },
    firstname: {
        type: Sequelize.STRING
    }
});

/**
 * Relationships
 */

/**
 * Synchronise
 */
account.sync().then(function () {
    info('Account sync completed')
});

module.exports = account;