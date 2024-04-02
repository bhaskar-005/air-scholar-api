const express = require('express');
const { capturePayment, verifyPayment } = require('../controllers/Payment');
const { verify, isStudent } = require('../middleware/verify');
const router = express.Router();

router.post('/capturepayment' ,verify,isStudent, capturePayment);
router.post('/verifyPayment',verify,isStudent, verifyPayment);

module.exports = router;