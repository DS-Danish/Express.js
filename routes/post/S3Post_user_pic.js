const express = require('express');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const multer = require('multer');
const router = express.Router();
const path = require('path');
const { pool } = require('../../database');

const s3 = new S3Client({ region: 'eu-north-1' });
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', upload.single('profilePic'), async (req, res) => {
  const { user } = req.session;
  const file = req.file;
  
  if (!file) {
    return res.status(400).send('No file uploaded.');
  }
  
  if (!user) {
    return res.status(400).send('User not found in session.');
  }

  const s3Key = `${user.id}/profile-pic-${Date.now().toString()}${path.extname(file.originalname)}`;
  const params = {
    Bucket: 'ds-profile-pics',
    Key: s3Key, // Adjust the key based on your storage structure
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  try {
    await s3.send(new PutObjectCommand(params));
  
    // Save the file path in the database
    const sql = 'UPDATE users SET s3_key = ? WHERE name = ?';
    pool.query(sql, [s3Key, user.name], (dbErr, results) => {
      if (dbErr) {
        console.error('Database Error:', dbErr);
        return res.status(500).send('Error saving file path in database');
      }
      res.send('File uploaded and path saved successfully.');
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error uploading the picture to S3');
  }
});

module.exports = router;
