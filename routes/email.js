const express = require('express');
const { requestPasswordReset, resetPassword } = require('../controllers/resetPass');

const router = express.Router();

router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);

module.exports = router;