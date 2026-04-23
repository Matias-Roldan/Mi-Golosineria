const { Readable } = require('stream');
const cloudinary = require('../config/cloudinary');

const UPLOAD_DEFAULTS = {
  folder: 'mi-golosineria/productos',
  transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto' }],
};

async function upload(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { ...UPLOAD_DEFAULTS, ...options },
      (err, result) => {
        if (err) return reject(err);
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    Readable.from(buffer).pipe(stream);
  });
}

async function deleteImage(publicId) {
  const result = await cloudinary.uploader.destroy(publicId);
  return result.result === 'ok';
}

module.exports = { upload, delete: deleteImage };
