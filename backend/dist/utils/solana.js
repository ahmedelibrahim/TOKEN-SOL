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
exports.getSolscanLink = exports.getBalance = exports.createToken = void 0;
const web3_js_1 = require("@solana/web3.js");
const spl_token_1 = require("@solana/spl-token");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Get network from environment variables
const SOLANA_NETWORK = process.env.SOLANA_NETWORK || 'devnet';
// Create connection to Solana network
const getConnection = () => {
    const endpoint = SOLANA_NETWORK === 'mainnet'
        ? 'https://api.mainnet-beta.solana.com'
        : 'https://api.devnet.solana.com';
    return new web3_js_1.Connection(endpoint, 'confirmed');
};
// Admin wallet to receive fees
const ADMIN_WALLET = new web3_js_1.PublicKey(process.env.ADMIN_WALLET || '7GRJYfbVLiRnMXg9PfhuwY954JuH6Nfqaaa1nZnuPj29');
// Token creation fees
const TOKEN_CREATION_FEE = parseFloat(process.env.TOKEN_CREATION_FEE || '0.1');
const ADMIN_FEE_PERCENTAGE = parseInt(process.env.ADMIN_FEE_PERCENTAGE || '50');
const createToken = (tokenDetails) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const connection = getConnection();
        // Create keypair from private key
        const payerKeypair = web3_js_1.Keypair.fromSecretKey(Buffer.from(tokenDetails.payerPrivateKey, 'base58'));
        // Create a new keypair for the token mint
        const mintAccount = web3_js_1.Keypair.generate();
        const tokenAddress = mintAccount.publicKey.toString();
        // Calculate minimum rent required for token mint
        const rentRequired = yield connection.getMinimumBalanceForRentExemption(spl_token_1.MINT_SIZE);
        // Create transaction to create token mint
        const transaction = new web3_js_1.Transaction();
        // Add instruction to create account for token mint
        transaction.add(web3_js_1.SystemProgram.createAccount({
            fromPubkey: payerKeypair.publicKey,
            newAccountPubkey: mintAccount.publicKey,
            lamports: rentRequired,
            space: spl_token_1.MINT_SIZE,
            programId: spl_token_1.TOKEN_PROGRAM_ID,
        }));
        // Initialize the token mint
        transaction.add((0, spl_token_1.createInitializeMintInstruction)(mintAccount.publicKey, tokenDetails.decimals, payerKeypair.publicKey, payerKeypair.publicKey, spl_token_1.TOKEN_PROGRAM_ID));
        // Create associated token account for the payer
        const associatedTokenAddress = yield (0, spl_token_1.getAssociatedTokenAddress)(mintAccount.publicKey, payerKeypair.publicKey, false, spl_token_1.TOKEN_PROGRAM_ID, spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID);
        // Add instruction to create associated token account
        transaction.add((0, spl_token_1.createAssociatedTokenAccountInstruction)(payerKeypair.publicKey, associatedTokenAddress, payerKeypair.publicKey, mintAccount.publicKey, spl_token_1.TOKEN_PROGRAM_ID, spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID));
        // Mint tokens to the payer's associated token account
        transaction.add((0, spl_token_1.createMintToInstruction)(mintAccount.publicKey, associatedTokenAddress, payerKeypair.publicKey, BigInt(tokenDetails.totalSupply * Math.pow(10, tokenDetails.decimals)), [], spl_token_1.TOKEN_PROGRAM_ID));
        // Send transaction
        const signature = yield (0, web3_js_1.sendAndConfirmTransaction)(connection, transaction, [payerKeypair, mintAccount], { commitment: 'confirmed' });
        // Generate explorer URL
        const explorerUrl = SOLANA_NETWORK === 'mainnet'
            ? `https://solscan.io/token/${tokenAddress}`
            : `https://solscan.io/token/${tokenAddress}?cluster=devnet`;
        return {
            tokenAddress,
            transactionSignature: signature,
            name: tokenDetails.name,
            symbol: tokenDetails.symbol,
            decimals: tokenDetails.decimals,
            totalSupply: tokenDetails.totalSupply,
            explorerUrl
        };
    }
    catch (error) {
        console.error('Error creating token:', error);
        throw error;
    }
});
exports.createToken = createToken;
const getBalance = (publicKey) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const connection = getConnection();
        const balance = yield connection.getBalance(publicKey);
        return balance / web3_js_1.LAMPORTS_PER_SOL;
    }
    catch (error) {
        console.error('Error getting balance:', error);
        throw error;
    }
});
exports.getBalance = getBalance;
const getSolscanLink = (address, type = 'token') => {
    const baseUrl = SOLANA_NETWORK === 'mainnet'
        ? 'https://solscan.io'
        : 'https://solscan.io?cluster=devnet';
    return `${baseUrl}/${type}/${address}`;
};
exports.getSolscanLink = getSolscanLink;
