var debug = require('debug');
var info = debug('aqua:database');
var user = require('./user');

/**
 * Database
 */
var Sequelize = require('sequelize')
var db = require('../database');

/**
 * Definition
 */
var log_info = db.define('logInfo', {
    title: {
        type: Sequelize.STRING
    },
    project: {
        type: Sequelize.STRING
    },
    week: {
        type: Sequelize.INTEGER
    }
});

/**
 * Relations
 */
log_info.belongsTo(user, { as: 'creator', constraints: false });

/**
 * Synchronise
 */
log_info.sync().then(function() {
    info('Log meta sync completed');
});

module.exports = log_info;
