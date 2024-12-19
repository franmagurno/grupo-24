const express = require('express');
const { requestPasswordReset } = require('../controllers/resetPass');

const router = express.Router();

router.post('/send-test-email', requestPasswordReset);

module.exports = router;