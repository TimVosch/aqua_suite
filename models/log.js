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
var log = db.define('log', {
    title: {
        type: Sequelize.STRING
    },
    project: {
        type: Sequelize.STRING
    },
    week: {
        type: Sequelize.INTEGER
    },
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
log.belongsTo(user, { as: 'creator', constraints: false });

/**
 * Synchronise
 */
log.sync().then(function() {
    info('Log sync completed');
});


module.exports = log;
