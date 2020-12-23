var express = require('express');
var router = express.Router();

// Require controller modules.
var controller = require('../controllers/indexController');

/* GET home page. */
router.get('/', controller.index);
router.get('/update', controller.update);

module.exports = router;
