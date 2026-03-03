import multer from "multer";
import path from "path";
import fs from "fs";

const productImagesDir = path.join(process.cwd(), "product-images");

if (!fs.existsSync(productImagesDir)) {
  fs.mkdirSync(productImagesDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, productImagesDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/\s+/g, "-");
    const unique = Date.now();
    cb(null, `${base}-${unique}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("Only image files are allowed"), false);
};

const uploadProductImage = multer({ storage, fileFilter });

export default uploadProductImage;
