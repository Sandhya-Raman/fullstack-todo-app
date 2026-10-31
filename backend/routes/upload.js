
const express = require("express");
const multer = require("multer");
const path = require("path");

const router = express.Router();

// Configure image storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },

    filename: (req, file, cb) => {
        const uniqueName =
            Date.now() + "-" + file.originalname;

        cb(null, uniqueName);
    }
});

// Allow only image files
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new Error("Only image files are allowed!"), false);
    }
};

// Configure Multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

// Image upload endpoint
router.post("/", upload.single("image"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            message: "Please select an image!"
        });
    }

    res.status(200).json({
        message: "Image uploaded successfully!",
        image: {
            filename: req.file.filename,
            path: `/uploads/${req.file.filename}`
        }
    });
});

module.exports = router;
