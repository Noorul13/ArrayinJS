const path = require("path");
const multer = require("multer");

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/gif",
    "image/bmp",
    "image/webp",
    "image/tiff",
    "image/svg+xml",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); // Accept file
  } else {
    cb(new Error("Only images are allowed!"), false); // Reject file
  }
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const originalExtension = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + originalExtension);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
});


// Multer middleware for error handling
const multerMiddleware = function (err, req, res, next) {
  if (err instanceof multer.MulterError) {
    // A Multer error occurred when uploading
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File size limit exceeded (Max 5MB)",
      });
    } else {
      return res.status(400).json({
        success: false,
        message: err.message, // General Multer error message
      });
    }
  } else if (err) {
    // An error occurred that is not a Multer error
    console.error(err); // Log the error for debugging purposes
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }

  // If no errors encountered, continue to the next middleware
  next();
};

module.exports = { upload, multerMiddleware };