// AI-GEN START - ChatGPT GPT-4
const express = require('express');
const bcrypt = require('bcrypt');
const { pool } = require('../../database');
const router = express.Router();

router.post('/', async (req, res) => {
  const { email, newPassword } = req.body;

  const sql = 'SELECT * FROM users WHERE email = ?';
  pool.query(sql, [email], async (dbErr, results) => {
    if (dbErr || results.length === 0) {
      console.error('Database Error or User not found:', dbErr);
      return res.status(400).send('User not found');
    }

    const user = results[0];
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updateSql = 'UPDATE users SET password = ? WHERE id = ?';
    pool.query(updateSql, [hashedPassword, user.id], (updateErr) => {
      if (updateErr) {
        console.error('Database Error:', updateErr);
        return res.status(500).send('Error updating password');
      }

      // Set a success message in the session
      req.session.message = 'Password reset successfully';
      res.redirect('/getProtectedPage'); // Redirect to the protected page
    });
  });
});

module.exports = router;
// AI-GEN END
