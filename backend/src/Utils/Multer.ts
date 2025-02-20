import multer from "multer";

// Multer setup for file handling
const storage = multer.memoryStorage();
const upload = multer({ storage });

export { upload };
