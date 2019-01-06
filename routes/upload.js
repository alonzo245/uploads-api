const express = require('express');
const { body } = require('express-validator/check');

const fileController = require('../controllers/upload');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

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
  fileController.createUpload
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
  fileController.updateUpload
);

router.delete(
  '/file/:uploadId',
  isAuth,
  fileController.deleteUpload
);

module.exports = router;
