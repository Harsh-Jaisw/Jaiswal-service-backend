const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');

// Ensure a directory exists
const ensureDirectoryExists = async (dirPath) => {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
};

// Process image and generate thumbnails
const processImage = async (filePath) => {
  const fileExtension = path.extname(filePath);
  const baseFileName = path.basename(filePath, fileExtension);

  const id = uuidv4();
  const thumbnailsDir = 'public/uploads/category/';

  await ensureDirectoryExists(thumbnailsDir);

  const smallThumbnailPath = path.join(thumbnailsDir, id + '-300x300' + fileExtension);
  const largeThumbnailPath = path.join(thumbnailsDir, id + '-600x600' + fileExtension);

  try {
    // Generate thumbnails
    await sharp(filePath).resize(300, 300).toFile(smallThumbnailPath);
    await sharp(filePath).resize(600, 600).toFile(largeThumbnailPath);

    // Return paths to the generated thumbnails
    return {
      small: `uploads/category/${id}-300x300${fileExtension}`,
      large: `uploads/category/${id}-600x600${fileExtension}`
    };
  } catch (error) {
    throw new Error('Failed to process image: ' + error.message);
  } finally {

    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
      await fs.unlink(filePath);
    } catch (error) {
      console.error(`Failed to delete original file: ${error.message}`);
    }
  }
};

// Multer setup and middleware
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // File name with timestamp
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 }, // Limit file size (1MB)
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  }
}).single('icon'); // Expect 'icon' field in form data

function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images Only!');
  }
}

// Middleware function
const uploadWithProcessing = async (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    if (req.file) {
      try {
        const filePath = path.join('public/uploads', req.file.filename);
        const thumbnails = await processImage(filePath);
        req.file.thumbnails = thumbnails;
      } catch (error) {
        return res.status(500).json({ error: error.message });
      }
    }

    next();
  });
};

module.exports = uploadWithProcessing;
