// AI-GEN START - ChatGPT GPT-4
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  const message = req.session.message || '';
  req.session.message = ''; // Clear message after reading
  res.render('login', { message });
});

module.exports = router;
// AI-GEN END
