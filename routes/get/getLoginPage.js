// signup.js
// AI-GEN START - ChatGPT GPT4
const express = require('express');
const router = express.Router();

router.get('/getLoginPage', function(req, res){
    const message = req.session.message || '';
    req.session.message = ''; // Clear message after reading
    console.log("message:", message)
    res.render('login', { message });
  });

module.exports = router;
// AI-GEN END
