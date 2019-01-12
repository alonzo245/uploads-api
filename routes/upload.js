const express = require('express');
const { body } = require('express-validator/check');

const uploadController = require('../controllers/upload');
const isAuth = require('../middleware/is-auth');
const fileUploader = require('../middleware/file-uploader');

const router = express.Router();

router.post('/files', isAuth, uploadController.getUploads);

router.get('/file/:uploadName', uploadController.getUpload);

router.post(
  '/file',
  isAuth,
  fileUploader,
  [
    body('userId')
      .trim(),
    body('privacy')
      .trim()
  ],
  uploadController.createUpload
);

router.put(
  '/file/:uploadId',
  isAuth,
  [
    body('privacy')
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
