import multer from 'multer';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/') // Specify the directory where you want to store uploaded files
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname) // Rename the file to avoid naming conflicts
  }
});

const upload = multer({ storage: storage });

export default upload;
