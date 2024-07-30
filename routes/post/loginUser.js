// AI-GEN START - ChatGPT GPT-4
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { pool } = require('../../database');

router.post('/', (req, res) => {
  const { email, password } = req.body;

  const sql = 'SELECT * FROM users WHERE email = ?';
  pool.query(sql, [email], async (dbErr, results) => {
    if (dbErr) {
      console.error('Database Error', dbErr);
      return res.status(500).send('Error logging in user');
    }

    if (results.length === 0) {
      req.session.message = 'Invalid email or password';
      return res.redirect('/getLoginPage');
    }

    const user = results[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      req.session.message = 'Invalid email or password';
      return res.redirect('/getLoginPage');
    }

    req.session.user = { id: user.id, name: user.name };
    req.session.message = 'Login successful';
    res.redirect('/getProtectedPage');
  });
});

module.exports = router;
// AI-GEN END
