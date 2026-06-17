import multer from "multer";

const storage = multer.memoryStorage();

/**
 * Image Upload Middleware
 */
const imageUpload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2 MB
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"));
    }

    cb(null, true);
  },
});

/**
 * CSV Upload Middleware
 */
const csvUpload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2 MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      "text/csv",
      "application/vnd.ms-excel",
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(new Error("Only CSV files are allowed"));
    }

    cb(null, true);
  },
});

/**
 * Single Image Upload
 */
export const uploadSingleImage = (req, res, next) => {
  imageUpload.single("image")(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        switch (err.code) {
          case "LIMIT_FILE_SIZE":
            return res.status(400).json({
              success: false,
              message:
                "Image size exceeds 2MB limit",
            });

          case "LIMIT_UNEXPECTED_FILE":
            return res.status(400).json({
              success: false,
              message: "Unexpected file field",
            });

          default:
            return res.status(400).json({
              success: false,
              message: err.message,
            });
        }
      }

      return res.status(400).json({
        success: false,
        message: err.message || "File upload error",
      });
    }

    next();
  });
};

/**
 * CSV Upload
 */
export const uploadCSV = (req, res, next) => {
  csvUpload.single("file")(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        switch (err.code) {
          case "LIMIT_FILE_SIZE":
            return res.status(400).json({
              success: false,
              message:
                "CSV file size exceeds 2MB limit",
            });

          case "LIMIT_UNEXPECTED_FILE":
            return res.status(400).json({
              success: false,
              message: "Unexpected file field",
            });

          default:
            return res.status(400).json({
              success: false,
              message: err.message,
            });
        }
      }

      return res.status(400).json({
        success: false,
        message: err.message || "CSV upload error",
      });
    }

    next();
  });
};
