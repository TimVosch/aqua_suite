var jwt = require('express-jwt');
module.exports = jwt({ secret: process.env.SHARED_SECRET || "SHARED_SECRET" });
