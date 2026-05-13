import multer from "multer";
import multerS3 from "multer-s3";
import s3 from "./aws.config";

export default multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.BUCKET_NAME,
    acl: "public-read", // or private depending on your need
    key: function (req, file, cb) {
      cb(null, Date.now().toString() + "-" + file.originalname);
    },
  }),
});
