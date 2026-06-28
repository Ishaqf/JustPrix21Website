const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadImage = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder }, (error, result) => {
      if (error) return reject(error);
      resolve({ url: result.secure_url, publicId: result.public_id });
    });
    stream.end(buffer);
  });
};

const deleteImage = (publicId) => cloudinary.uploader.destroy(publicId);

// Product.images only stores secure_urls (schema is [String]), so deleting
// or replacing an image later means deriving the public_id back out of the
// URL: strip the domain+version prefix, then the file extension.
const getPublicIdFromUrl = (url) => {
  try {
    const afterUpload = url.split('/upload/')[1];
    if (!afterUpload) return null;
    const withoutVersion = afterUpload.replace(/^v\d+\//, '');
    return withoutVersion.replace(/\.[^/.]+$/, '');
  } catch {
    return null;
  }
};

module.exports = { uploadImage, deleteImage, getPublicIdFromUrl };
