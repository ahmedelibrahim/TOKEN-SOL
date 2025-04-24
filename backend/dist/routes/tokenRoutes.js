"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const tokenController_1 = require("../controllers/tokenController");
const upload_1 = __importDefault(require("../middleware/upload"));
const router = express_1.default.Router();
// Create a new token
router.post('/create', upload_1.default.single('logo'), tokenController_1.createNewToken);
// Get token information
router.get('/:tokenAddress', tokenController_1.getTokenInfo);
exports.default = router;
