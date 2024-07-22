// signup.js
// AI-GEN START - ChatGPT GPT4
const express = require('express');
const router = express.Router();

router.get('/getProtectedPage', function(req, res){
    if (!req.session.user) {
      return res.redirect('/getLoginPage');
    }
  
    res.render('protected_page', { user: req.session.user });
  });

module.exports = router;
// AI-GEN END
