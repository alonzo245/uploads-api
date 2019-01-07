const fs = require('fs');
const path = require('path');
const isAuth = require('../middleware/is-auth');
const { validationResult } = require('express-validator/check');

const Upload = require('../models/upload');
const User = require('../models/user');

exports.getUploads = (req, res, next) => {
  User.findById(req.userId)
    .populate('uploads')
    .then(uploads => {
      res.status(200).json({
        message: 'Fetched uploads successfully.',
        uploads: uploads
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.createUpload = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, entered data is incorrect.');
    error.statusCode = 422;
    throw error;
  }
  console.log(req.file)
  if (!req.file) {
    const error = new Error('No upload provided.');
    error.statusCode = 422;
    throw error;
  }

  let creator;
  const uploadUrl = req.file.path;
  const upload = new Upload({
    uploadUrl: uploadUrl,
    uploadName: req.file.originalname,
    privacy: req.body.privacy,
    creator: req.userId
  });

  upload
    .save()
    .then(result => {
      return User.findById(req.userId);
    })
    .then(user => {
      creator = user;
      user.uploads.push(upload);
      return user.save();
    })
    .then(result => {
      res.status(201).json({
        message: 'Upload created!',
        upload: upload,
        creator: { _id: creator._id }
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getUpload = (req, res, next) => {
  const uploadName = req.params.uploadName;
  Upload.findOne({ uploadName: uploadName })
    .then(upload => {
      if (!upload) {
        const error = new Error('Could not find upload.');
        error.statusCode = 404;
        throw error;
      }

      if (req.query.metadata === 'true') {
        if (upload.privacy && req.header('x-auth-token') !== upload.id) {
          const error = new Error('Not authorized!');
          error.statusCode = 403;
          throw error;
          return;
        }

        const extension = path.extname(upload.uploadUrl);
        const fileSizeInBytes = fs.statSync(upload.uploadUrl).size;
        res.status(200).json({
          message: 'Upload fetched.',
          upload: { 
            name: upload.uploadUrl, 
            extension, fileSizeInBytes,
            modified: upload.updatedAt
          }
        });

      } else {
        if (upload.privacy && req.header('x-auth-token') !== upload.id) {
          const error = new Error('Not authorized!');
          error.statusCode = 403;
          throw error;

        } else {
          return res.download(upload.uploadUrl);
        }
      }
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.updateUpload = (req, res, next) => {
  const uploadId = req.params.uploadId;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, entered data is incorrect.');
    error.statusCode = 422;
    throw error;
  }

  let privacy = req.body.privacy;
  let uploadUrl = req.body.uploadUrl;
  if (req.file) {
    uploadUrl = req.file.path;
  }
  if (!uploadUrl) {
    const error = new Error('No file picked.');
    error.statusCode = 422;
    throw error;
  }
  Upload.findById(uploadId)
    .then(upload => {
      if (!upload) {
        const error = new Error('Could not find upload.');
        error.statusCode = 404;
        throw error;
      }
      if (upload.creator.toString() !== req.userId) {
        const error = new Error('Not authorized!');
        error.statusCode = 403;
        throw error;
      }
      if (uploadUrl !== upload.uploadUrl) {
        removeUpload(upload.uploadUrl);
      }
      upload.privacy = privacy;
      upload.uploadUrl = uploadUrl;
      return upload.save();
    })
    .then(result => {
      res.status(200).json({ message: 'Upload updated!', upload: result });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.deleteUpload = (req, res, next) => {
  const uploadId = req.params.uploadId;
  Upload.findById(uploadId)
    .then(upload => {
      if (!upload) {
        const error = new Error('Could not find upload.');
        error.statusCode = 404;
        throw error;
      }
      if (upload.creator.toString() !== req.userId) {
        const error = new Error('Not authorized!');
        error.statusCode = 403;
        throw error;
      }
      // Check logged in user
      removeUpload(upload.uploadUrl);
      return Upload.findByIdAndRemove(uploadId);
    })
    .then(result => {
      return User.findById(req.userId);
    })
    .then(user => {
      user.uploads.pull(uploadId);
      return user.save();
    })
    .then(result => {
      res.status(200).json({ message: 'Deleted upload.' });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

const removeUpload = filePath => {
  filePath = path.join(__dirname, '..', filePath);
  fs.unlink(filePath, err => console.log(err));
};
