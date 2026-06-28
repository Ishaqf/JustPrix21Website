const multer = require('multer');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      return cb(null, true);
    }
    cb(new Error('Seuls les fichiers image sont autorisés'));
  },
});

const handleUpload = (fieldName, maxCount) => {
  const middleware = upload.array(fieldName, maxCount);

  return (req, res, next) => {
    middleware(req, res, (err) => {
      if (!err) return next();

      res.status(400);
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(new Error('Image trop volumineuse (5 Mo maximum)'));
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return next(new Error(`Trop d'images envoyées (${maxCount} maximum)`));
      }
      next(new Error(err.message));
    });
  };
};

module.exports = { handleUpload };
