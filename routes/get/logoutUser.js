// AI-GEN START - ChatGPT GPT-4
const express = require('express');
const router = express.Router();

router.get('/', function(req, res) {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).send('Error logging out');
    }
    res.redirect('/getLoginPage');
  });
});

module.exports = router;
// AI-GEN END
