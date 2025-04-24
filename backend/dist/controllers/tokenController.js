"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTokenInfo = exports.createNewToken = void 0;
const solana_1 = require("../utils/solana");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const createNewToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tokenData = req.body;
        // Validate required fields
        if (!tokenData.name || !tokenData.symbol || !tokenData.payerPrivateKey) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: name, symbol, or payerPrivateKey'
            });
        }
        // Set default values if not provided
        const decimals = tokenData.decimals || 9;
        const totalSupply = tokenData.totalSupply || 1000000000;
        // Create token on Solana blockchain
        const token = yield (0, solana_1.createToken)({
            name: tokenData.name,
            symbol: tokenData.symbol,
            decimals,
            totalSupply,
            payerPrivateKey: tokenData.payerPrivateKey
        });
        // Handle logo file if uploaded
        let logoUrl = null;
        if (req.file) {
            const uploadDir = process.env.UPLOAD_DIR || 'uploads';
            const baseUrl = req.protocol + '://' + req.get('host');
            logoUrl = `${baseUrl}/${uploadDir}/${req.file.filename}`;
        }
        // Enhance the created token with additional fields
        const enhancedToken = Object.assign(Object.assign({}, token), { logo: logoUrl, description: tokenData.description, socialLinks: tokenData.socialLinks || null, creator: tokenData.creator || null, options: tokenData.options || {
                revokeMint: false,
                revokeFreeze: false,
                revokeUpdate: false
            } });
        res.status(201).json({
            success: true,
            token: enhancedToken
        });
    }
    catch (error) {
        console.error('Error in token creation:', error);
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'An unexpected error occurred'
        });
    }
});
exports.createNewToken = createNewToken;
const getTokenInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { tokenAddress } = req.params;
        if (!tokenAddress) {
            return res.status(400).json({
                success: false,
                message: 'Token address is required'
            });
        }
        // In a real implementation, you would fetch token info from Solana
        // For now, we'll just return a placeholder response
        res.status(200).json({
            success: true,
            message: 'This endpoint will be implemented to fetch token details',
            tokenAddress
        });
    }
    catch (error) {
        console.error('Error getting token info:', error);
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'An unexpected error occurred'
        });
    }
});
exports.getTokenInfo = getTokenInfo;
