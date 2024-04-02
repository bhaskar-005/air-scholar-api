const express = require('express');
const router = express.Router();
const {contectUs} = require('../controllers/contactUsController');


router.post('/contectUs' , contectUs);

module.exports = router;