// const fs = require('fs').promises;
// const path = require('path');
// const sharp = require('sharp');
// const { v4: uuidv4 } = require('uuid');
// const multer = require('multer');

// // Ensure a directory exists
// const ensureDirectoryExists = async (dirPath) => {
//   try {
//     await fs.access(dirPath);
//   } catch {
//     await fs.mkdir(dirPath, { recursive: true });
//   }
// };

// // Process image and optionally resize
// const processImage = async (filePath, outputDir, resize = false) => {
//   const fileExtension = path.extname(filePath);
//   const id = uuidv4();
//   await ensureDirectoryExists(outputDir);

//   // If resizing is needed, specify sizes
//   const sizes = resize
//     ? [
//         { suffix: 'small', width: 300, height: 300 },
//         { suffix: 'large', width: 600, height: 600 },
//       ]
//     : [{ suffix: 'original', width: 300, height: 300 }]; // Only one size if not resizing

//   const processingPromises = sizes.map(({ suffix, width, height }) => {
//     const thumbnailPath = path.join(outputDir, `${id}-${width}x${height}${fileExtension}`);
//     const sharpImage = sharp(filePath);
//     if (width && height) {
//       sharpImage.resize(width, height);
//     }
//     return sharpImage
//       .toFile(thumbnailPath)
//       .then(() => ({
//         [suffix]: path.join('uploads', path.basename(outputDir), `${id}-${width}x${height}${fileExtension}`),
//       }))
//       .catch((error) => {
//         console.error(`Failed to process image ${suffix}: ${error.message}`);
//         throw error;
//       });
//   });

//   try {
//     const results = await Promise.all(processingPromises);
//     return results.reduce((acc, result) => ({ ...acc, ...result }), {});
//   } catch (error) {
//     console.error('Failed to process image:', error.message);
//     throw new Error('Failed to process image: ' + error.message);
//   }
// };

// // Multer setup and middleware
// const storage = multer.diskStorage({
//   destination: async (req, file, cb) => {
//     const destDir = 'public/uploads/';
//     try {
//       await ensureDirectoryExists(destDir);
//       cb(null, destDir);
//     } catch (err) {
//       console.error(`Failed to ensure directory exists: ${err.message}`);
//       cb(err);
//     }
//   },
//   filename: (req, file, cb) => {
//     const filename = Date.now() + path.extname(file.originalname);
//     cb(null, filename);
//   },
// });

// const upload = multer({
//   storage: storage,
//   limits: { fileSize: 100000000 }, // 1MB limit
//   fileFilter: (req, file, cb) => {
//     checkFileType(file, cb);
//   },
// }).single('icon'); // Single file upload

// // Check file type
// function checkFileType(file, cb) {
//   const filetypes = /jpeg|jpg|png/;
//   const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
//   const mimetype = filetypes.test(file.mimetype);

//   if (mimetype && extname) {
//     return cb(null, true);
//   } else {
//     console.error('Error: Images Only!');
//     cb('Error: Images Only!');
//   }
// }

// // Middleware function
// const uploadWithProcessing = (options = {}) => {
//   const { defaultDir = 'public/uploads/profile/', resize = false } = options;

//   return async (req, res, next) => {
//     upload(req, res, async (err) => {
//       if (err) {
//         console.error('Upload error:', err.message);
//         return res.status(400).json({ error: err.message });
//       }

//       if (req.file) {
//         try {
//           const tempFilePath = path.join(req.file.destination, req.file.filename);
//           const destinationDir = defaultDir;
//           const images = await processImage(tempFilePath, destinationDir, resize);

//           // Prepare response with image paths
//           req.fileDetails = {
//             original: images.original || images.small, // Use 'small' as a fallback
//             small: images.small,
//             large: images.large,
//           };

//           // Attempt to delete the file from the temporary directory
//           try {
//             console.log(`Attempting to delete temporary file: ${tempFilePath}`);
//             await fs.unlink(tempFilePath);
//             console.log('Temporary file deleted successfully.');
//           } catch (unlinkError) {
//             console.error(`Failed to delete temporary file: ${unlinkError.message}`);
//             // Optional: Handle unlinking error or notify the user
//           }
//         } catch (error) {
//           console.error('Processing error:', error.message);
//           return res.status(500).json({ error: error.message });
//         }
//       } else {
//         // No file uploaded, no need to process or return an error
//         req.fileDetails = {};
//       }

//       next();
//     });
//   };
// };

// module.exports = uploadWithProcessing;

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

// Process image and optionally resize
const processImage = async (filePath, outputDir, resize = false) => {
  const fileExtension = path.extname(filePath);
  const id = uuidv4();
  await ensureDirectoryExists(outputDir);

  const sizes = resize
    ? [
        { suffix: 'small', width: 300, height: 300 },
        { suffix: 'large', width: 600, height: 600 },
      ]
    : [{ suffix: 'original', width: 300, height: 300 }]; // Only one size if not resizing

  const processingPromises = sizes.map(({ suffix, width, height }) => {
    const thumbnailPath = path.join(outputDir, `${id}-${width}x${height}${fileExtension}`);
    const sharpImage = sharp(filePath);
    if (width && height) {
      sharpImage.resize(width, height);
    }
    return sharpImage
      .toFile(thumbnailPath)
      .then(() => ({
        [suffix]: path.join('uploads', path.basename(outputDir), `${id}-${width}x${height}${fileExtension}`),
      }))
      .catch((error) => {
        console.error(`Failed to process image ${suffix}: ${error.message}`);
        throw error;
      });
  });

  try {
    const results = await Promise.all(processingPromises);
    return results.reduce((acc, result) => ({ ...acc, ...result }), {});
  } catch (error) {
    console.error('Failed to process image:', error.message);
    throw new Error('Failed to process image: ' + error.message);
  }
};

// Multer setup and middleware
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const destDir = 'public/uploads/';
    try {
      await ensureDirectoryExists(destDir);
      cb(null, destDir);
    } catch (err) {
      console.error(`Failed to ensure directory exists: ${err.message}`);
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const filename = Date.now() + path.extname(file.originalname);
    cb(null, filename);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 100000000 }, // 100MB limit (not 1MB as noted)
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  },
}).single('icon'); // Single file upload

// Check file type
function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    console.error('Error: Images Only!');
    cb('Error: Images Only!');
  }
}

// Middleware function
const uploadWithProcessing = (options = {}) => {
  const { defaultDir = 'public/uploads/profile/', resize = false } = options;

  return async (req, res, next) => {
    upload(req, res, async (err) => {
      if (err) {
        console.error('Upload error:', err.message);
        return res.status(400).json({ error: err.message });
      }

      if (req.file) {
        try {
          const tempFilePath = path.join(req.file.destination, req.file.filename);
          const destinationDir = defaultDir;
          console.log(`Processing image at: ${tempFilePath}`);
          const images = await processImage(tempFilePath, destinationDir, resize);

          // Prepare response with image paths
          req.fileDetails = {
            original: images.original || images.small,
            small: images.small,
            large: images.large,
          };

          // Attempt to delete the file from the temporary directory
          try {
            console.log(`Attempting to delete temporary file: ${tempFilePath}`);
            await fs.unlink(tempFilePath);
            console.log('Temporary file deleted successfully.');
          } catch (unlinkError) {
            console.error(`Failed to delete temporary file: ${unlinkError.message}`);
          }
        } catch (error) {
          console.error('Processing error:', error.message);
          return res.status(500).json({ error: error.message });
        }
      } else {
        req.fileDetails = {}; // No file uploaded, no need to process
      }

      next();
    });
  };
};

module.exports = uploadWithProcessing;
