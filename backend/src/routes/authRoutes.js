import express from 'express';
import authController from '../controllers/authController.js';

const router = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     description: Create a new user account with email/password or wallet address
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *           examples:
 *             withEmail:
 *               summary: Register with email and wallet
 *               value:
 *                 email: "demo@sharedocs.app"
 *                 password: "Demo123!"
 *                 walletAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
 *                 fullName: "Demo User"
 *             walletOnly:
 *               summary: Register with email only (recommended)
 *               value:
 *                 email: "demo@sharedocs.app"
 *                 password: "Demo123!"
 *                 fullName: "Demo User"
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 */
router.post('/register', authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login with email and password
 *     tags: [Authentication]
 *     description: Authenticate user using email and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           example:
 *             email: "demo@sharedocs.app"
 *             password: "Demo123!"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: Unauthorized - invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 */
router.post('/login', authController.login);

/**
 * @swagger
 * /api/auth/wallet:
 *   put:
 *     summary: Connect wallet to existing account
 *     tags: [Authentication]
 *     description: Associate an Ethereum wallet address with an existing user account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - walletAddress
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *                 description: User ID from registration
 *               walletAddress:
 *                 type: string
 *                 pattern: '^0x[a-fA-F0-9]{40}$'
 *                 description: Ethereum wallet address
 *           example:
 *             userId: "b716e84d-d5c5-4f75-97a5-129a457f975a"
 *             walletAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
 *     responses:
 *       200:
 *         description: Wallet connected successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Bad request - wallet already in use or invalid format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 */
router.put('/wallet', authController.connectWallet);

/**
 * @swagger
 * /api/auth/login/wallet:
 *   post:
 *     summary: Login with wallet address
 *     tags: [Authentication]
 *     description: Authenticate user using Ethereum wallet address (simplified for demo)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WalletLoginRequest'
 *           example:
 *             walletAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
 *     responses:
 *       200:
 *         description: Wallet login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       404:
 *         description: Wallet address not registered
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 */
router.post('/login/wallet', authController.loginWithWallet);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     tags: [Authentication]
 *     description: Send a password reset link to the user's email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *           example:
 *             email: "user@example.com"
 *     responses:
 *       200:
 *         description: Reset link sent
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/forgot-password', authController.forgotPassword);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password
 *     tags: [Authentication]
 *     description: Reset user password using a valid reset token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - password
 *               - confirmPassword
 *             properties:
 *               token:
 *                 type: string
 *               password:
 *                 type: string
 *               confirmPassword:
 *                 type: string
 *           example:
 *             token: "abcdef123456"
 *             password: "NewPassword123!"
 *             confirmPassword: "NewPassword123!"
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid or expired token
 *       500:
 *         description: Internal server error
 */
router.post('/reset-password', authController.resetPassword);

export default router;
