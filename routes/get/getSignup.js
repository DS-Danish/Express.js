// signup.js
// AI-GEN START - ChatGPT GPT4
const express = require('express');
const router = express.Router();

router.get('/getSignupPage', function(req, res){
  res.render('signup', { message: '' });
});

module.exports = router;
// AI-GEN END
