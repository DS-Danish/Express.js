const express = require('express');
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const router = express.Router();
const stream = require('stream');
const { promisify } = require('util');

const s3 = new S3Client({ region: 'us-east-1' });
const pipeline = promisify(stream.pipeline);

router.get('/', async (req, res) => {
    const { username } = req.params;
    const params = {
        Bucket: 'ds-profile-pics',
        Key: `${username}/users/Danish /profile-pic.jpg`, // Adjust the key based on your storage structure
    };

    try {
        const data = await s3.send(new GetObjectCommand(params));
        await pipeline(data.Body, res); // Use pipeline to pipe the data stream to the response
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving the picture from S3');
    }
});

module.exports = router;
