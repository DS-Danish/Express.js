// AI-GEN START - ChatGPT GPT-4
const multer = require('multer');
const multerS3 = require('multer-s3');
const AWS = require('aws-sdk');
const path = require('path');

// Configure AWS SDK
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();

const upload = multer({
  storage: multerS3({
    s3,
    bucket: 'ds-profile-pics',
    acl: 'public-read',
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      const fileName = `users/${req.body.name}/profile-pic-${Date.now().toString()}${path.extname(file.originalname)}`;
      cb(null, fileName);
    }
  }),
  limits: {
    fileSize: 1000000, // Maximum 1 MB
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('Please upload an image (jpg, jpeg, png)'));
    }
    cb(null, true);
  }
});

module.exports = upload;
// AI-GEN END
