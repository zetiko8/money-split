import multer from 'multer';
import path from 'path';

const multerStorage = multer.diskStorage({
  destination: (
    req, file, cb,
  ) => {
    cb(null, path.join(__dirname, 'assets'));
  },
  filename: function (req, file, cb) {

    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (!(mimetype && extname)) {
      console.log('Rejected file upload type: ' + file.mimetype + ' - ' + file.originalname);
      return cb('Error: File upload only supports the following filetypes - ' + filetypes);
    }

    const uniqueSuffix
      = Date.now()
        + '-' + Math.round(Math.random() * 1E9);
    cb(
      null,
      uniqueSuffix + '.' +
      file.originalname.split('.')[1],
    );
  },
});

const upload = multer({
  storage: multerStorage,
  limits: { fileSize: 1048576 },
});

export const UPLOAD_SERVICE = {
  upload,
};