var Sequelize = require('Sequelize')
var db = require('../database');

var Account = db.define('account', {
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

// Account.sync({force: true}).then(function () {
//   return Account.create({
//     username: 'username',
//     password: 'password',
//     firstname: 'firstname'
//   });
// });

module.exports = Account;