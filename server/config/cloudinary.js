require("dotenv").config(); // ✅ Must come first

const cloudinary = require("cloudinary").v2; // ✅ THEN load cloudinary
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// ✅ Now configure cloudinary using your actual .env values
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// ✅ Set up storage for multer to use Cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "m_bloggify",
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});

module.exports = {
  cloudinary,
  storage,
};
