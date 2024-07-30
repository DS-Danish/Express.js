const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    console.log('GET /getSignupPage hit');
    res.render('signup', { message: req.session.message || '' });
});

module.exports = router;
