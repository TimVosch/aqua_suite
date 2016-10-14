var Sequelize = require('sequelize');

var sequelize = new Sequelize(process.env.SQL_DATABASE, process.env.SQL_USER, process.env.SQL_PASS, {
    host: process.env.SQL_HOST || 'localhost',
    dialect: 'mssql',
    dialectOptions: {
        encrypt: true
    },
    port: 1433,

    pool: {
        max: process.env.SQL_MAX_POOL_SIZE || 5,
        min: 0,
        idle: 10000
    }
});

sequelize
  .authenticate()
  .then(function(err) {
    console.log('Connection has been established successfully.');
  })
  .catch(function (err) {
    console.log('Unable to connect to the database:', err);
  });

module.exports = sequelize;