var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  var json = { title: 'Express' };

  res.format({
    html: function() {
      res.render('index', json);
    },

    json: function() {
      res.json(json);
    }
  });
});

module.exports = router;
