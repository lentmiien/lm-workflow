var express = require('express');
var router = express.Router();

// Require controller modules.
var controller = require('../controllers/indexController');

/* GET home page. */
router.get('/', controller.index);
router.get('/update', controller.update);
router.get('/processdetails', controller.processdetails);
router.get('/newprocess', controller.processeditor);
router.get('/editprocess', controller.processeditor);
router.post('/saveprocess', controller.saveprocess);

module.exports = router;
