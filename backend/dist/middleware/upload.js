"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Set storage engine
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = process.env.UPLOAD_DIR || 'uploads';
        const uploadPath = path_1.default.join(__dirname, '../../', uploadDir);
        // Create directory if it doesn't exist
        if (!fs_1.default.existsSync(uploadPath)) {
            fs_1.default.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        // Create unique filename with original extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path_1.default.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});
// Check file type
const fileFilter = (req, file, cb) => {
    // Allowed file types
    const filetypes = /jpeg|jpg|png|gif|svg/;
    // Check extension
    const extname = filetypes.test(path_1.default.extname(file.originalname).toLowerCase());
    // Check mime type
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
        return cb(null, true);
    }
    else {
        cb(new Error('Error: Images Only!'));
    }
};
// Initialize upload
const upload = (0, multer_1.default)({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max file size
    fileFilter: fileFilter
});
exports.default = upload;
