const express = require('express');
const { pool } = require('../../database');
const router = express.Router();

router.get('/', (req, res) => {
  if (!req.session.user) {
    req.session.message = 'Please log in to access the protected page';
    return res.redirect('/getLoginPage');
  }

  const userId = req.session.user.id;
  const sql = 'SELECT name, password, s3_key FROM users WHERE id = ?';

  pool.query(sql, [userId], (dbErr, results) => {
    if (dbErr) {
      console.error('Database Error:', dbErr);
      return res.status(500).send('Error fetching user data');
    }
                                                                      
    if (results.length > 0) {
      const userName = results[0].name;
      const userPassword = results[0].password;
      const s3Key = results[0].s3_key;

      const profilePicUrl = s3Key ? `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}` : null;
      console.log("path", profilePicUrl)
      res.render('protected_page', {
        user: { name: userName, password: userPassword, profilePicUrl: profilePicUrl }
      });
    } else {
      console.error('No user found with ID:', userId);
      res.render('protected_page', {
        user: { name: req.session.user.name, password: req.session.user.password, profilePicUrl: null }
      });
    }
  });
});

module.exports = router;