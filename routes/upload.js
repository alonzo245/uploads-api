const express = require('express');
const { body } = require('express-validator/check');

const uploadController = require('../controllers/upload');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/files', isAuth, uploadController.getUploads);

router.get('/file/:uploadName', uploadController.getUpload);

router.post(
  '/file',
  isAuth,
  [
    body('userId')
      .trim(),
    body('privacy')
      .trim(),
    body('creator')
      .trim()
  ],
  uploadController.createUpload
);

router.put(
  '/file/:uploadId',
  isAuth,
  [
    body('title')
      .trim(),
    body('content')
      .trim()
  ],
  uploadController.updateUpload
);

router.delete(
  '/file/:uploadId',
  isAuth,
  uploadController.deleteUpload
);

module.exports = router;
