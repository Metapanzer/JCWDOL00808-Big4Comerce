// Import Multer
const { multerUpload } = require("./../lib/multer");

// Import deleteFiles
const deleteFiles = require("./../helper/deleteFiles");

const uploadImages = (req, res, next) => {
  const multerResult = multerUpload.fields([{ name: "images", maxCount: 1 }]);
  multerResult(req, res, function (err) {
    try {
      if (err) throw err;

      req.files.images.forEach((value) => {
        //adjust max file sizes in bytes
        if (value.size > 5000000)
          throw {
            message: `${value.originalname} size too large`,
          };
      });

      next();
    } catch (error) {
      if (req.files.images) {
        deleteFiles(req.files.images);
      }
      res.status(400).send({
        isError: true,
        message: error.message,
        data: null,
      });
    }
  });
};

module.exports = uploadImages;
