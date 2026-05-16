import multer from "multer";

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

export const uploadSingleImage = (req, res, next) => {
  multer({
    storage,

    limits: {
      fileSize: 2 * 1024 * 1024,
    },

    fileFilter: (req, file, cb) => {
      if (!file.mimetype.startsWith("image/")) {
        return cb(
          new Error("Only image files are allowed")
        );
      }

      cb(null, true);
    },
  }).single("image")(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        message: err.message || "File upload error",
      });
    }

    next();
  });
};

export const uploadCSV = (req, res, next) => {
  multer({
    storage,

    limits: {
      fileSize: 2 * 1024 * 1024,
    },

    fileFilter: (req, file, cb) => {

      const allowedMimeTypes = [
        "text/csv",
        "application/vnd.ms-excel",
      ];

      if (
        !allowedMimeTypes.includes(file.mimetype)
      ) {
        return cb(
          new Error("Only CSV files are allowed")
        );
      }

      cb(null, true);
    },
  }).single("file")(req, res, (err) => {

    if (err) {
      return res.status(400).json({
        message: err.message || "CSV upload error",
      });
    }

    next();
  });
};