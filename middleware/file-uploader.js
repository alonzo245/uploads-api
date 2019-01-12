const multer = require('multer');
var mkdirp = require('mkdirp');

const fileFilter = (req, file, cb) => {
  cb(null, true);
};

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dest = 'uploads/' + req.body.userId + '/';
    mkdirp.sync(dest);
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
    // cb(null, new Date().toISOString() + '-' + file.originalname);
  }
});

module.exports = multer({ storage: fileStorage, fileFilter: fileFilter }).single('fileUpload');