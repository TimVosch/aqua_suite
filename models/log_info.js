var debug = require('debug');
var info = debug('aqua:database');
var account = require('./account');

/**
 * Database
 */
var Sequelize = require('Sequelize')
var db = require('../database');

/**
 * Definition
 */
var log_info = db.define('logInfo', {
    title: {
        type: Sequelize.STRING
    }
});

/**
 * Relations
 */
log_info.belongsTo(account, { as: 'creator', constraints: false });

/**
 * Synchronise
 */
log_info.sync().then(function() {
    info('Log meta sync completed');
});

module.exports = log_info;