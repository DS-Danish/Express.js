const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const multer = require('multer');
const AWS = require('aws-sdk');
const { pool } = require('../../database');

// Configure AWS SDK
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', upload.single('profilePic'), async (req, res) => {
  const { name, email, password } = req.body;
  const profilePic = req.file;

  console.log('Received name:', name);
  console.log('Received email:', email);
  console.log('Received password:', password);
  console.log('Received profilePic:', profilePic);

  if (!profilePic) {
    return res.status(400).send('Profile picture is required');
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    // Upload profile picture to S3
    const s3Key = `users/${name}ds-profile-pics.s3.eu-north-1.amazonaws.com/users/Danish+/profile-pic.jpg`;
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: s3Key,
      Body: profilePic.buffer,
      ContentType: profilePic.mimetype,
    };

    let resp = await s3.putObject(params).promise();

    console.log("resppppppp",resp)
    // Save user details to the database
    const sql = 'INSERT INTO users (name, email, password, s3_key) VALUES (?, ?, ?, ?)';
    pool.query(sql, [name, email, hashedPassword, s3Key], (dbErr, results) => {
      if (dbErr) {
        console.error('Database Error:', dbErr);
        return res.status(500).send('Error creating user');
      }
      console.log('User created successfully:', results);
      req.session.message = 'User created successfully. Please log in.';
      res.redirect('/getLoginPage');
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Error signing up user');
  }
});

module.exports = router; 