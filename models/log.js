var debug = require('debug');
var info = debug('aqua:database');
var log_info = require('./log_info');

/**
 * Database
 */
var Sequelize = require('Sequelize')
var db = require('../database');

/**
 * Definition
 */
var log = db.define('log', {
    commitHistory: {
        type: Sequelize.TEXT,
    },
    comments: {
        type: Sequelize.TEXT
    }
});

/**
 * Relationships
 */
log.belongsTo(log_info, { constraints: false });

/**
 * Synchronise
 */
log.sync().then(function() {
    info('Log sync completed');
});

module.exports = log;