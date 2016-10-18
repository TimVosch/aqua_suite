var express = require('express');
var router = express.Router();

router.use('/', function (req, res ,next) {
    var json = { user: req.user, pageName: req.user.firstname + '\'s Dashboard' };
    res.format({
        html: function() {
            return res.render('frontpage', json);
        },

        json: function() {
            return res.json(json);
        }
    });
});

module.exports = router;