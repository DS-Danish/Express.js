// signup.js
// AI-GEN START - ChatGPT GPT4
const express = require('express');
const router = express.Router();

router.get('/logoutUser', function(req, res){
  req.session.destroy();
  res.redirect('/getLoginPage');
});

module.exports = router;
// AI-GEN END
