import express from 'express';
import * as documentController from '../controllers/documentController.js';

const router = express.Router();

/**
 * @swagger
 * /api/documents:
 *   post:
 *     summary: Create document record after blockchain upload
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - documentHash
 *               - ipfsCid
 *               - filename
 *               - fileSize
 *             properties:
 *               documentHash:
 *                 type: string
 *                 example: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
 *               ipfsCid:
 *                 type: string
 *                 example: "QmXyZ123..."
 *               filename:
 *                 type: string
 *                 example: "Contract_2024.pdf"
 *               fileSize:
 *                 type: integer
 *                 example: 1048576
 *               fileType:
 *                 type: string
 *                 example: "application/pdf"
 *               metadata:
 *                 type: object
 *               blockchainTxHash:
 *                 type: string
 *               blockchainTimestamp:
 *                 type: integer
 *               visibility:
 *                 type: string
 *                 enum: [PUBLIC, PRIVATE]
 *                 default: PRIVATE
 *     responses:
 *       201:
 *         description: Document created successfully
 *       400:
 *         description: Invalid input
 *       409:
 *         description: Document already exists
 */
router.post('/', documentController.createDocument);

/**
 * @swagger
 * /api/documents/user/{userId}:
 *   get:
 *     summary: Get documents for a specific user
 *     tags: [Documents]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by filename or hash
 *       - in: query
 *         name: fileType
 *         schema:
 *           type: string
 *         description: Filter by file type
 *       - in: query
 *         name: visibility
 *         schema:
 *           type: string
 *           enum: [PUBLIC, PRIVATE]
 *         description: Filter by visibility
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [created_at, filename, file_size, updated_at]
 *           default: created_at
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           maximum: 100
 *     responses:
 *       200:
 *         description: List of user's documents with pagination
 *       400:
 *         description: Invalid user ID format
 */
router.get('/user/:userId', documentController.getUserDocumentsByUserId);

/**
 * @swagger
 * /api/documents/public:
 *   get:
 *     summary: Get all public documents with search and filter
 *     tags: [Documents]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by filename or hash
 *       - in: query
 *         name: fileType
 *         schema:
 *           type: string
 *         description: Filter by file type
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [created_at, filename, file_size, updated_at]
 *           default: created_at
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           maximum: 100
 *     responses:
 *       200:
 *         description: List of public documents with pagination
 */
router.get('/public', documentController.getPublicDocuments);

/**
 * @swagger
 * /api/documents:
 *   get:
 *     summary: Get user's documents with search and filter (legacy)
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by filename or hash
 *       - in: query
 *         name: fileType
 *         schema:
 *           type: string
 *         description: Filter by file type
 *       - in: query
 *         name: visibility
 *         schema:
 *           type: string
 *           enum: [PUBLIC, PRIVATE]
 *         description: Filter by visibility
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [created_at, filename, file_size, updated_at]
 *           default: created_at
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           maximum: 100
 *     responses:
 *       200:
 *         description: List of documents with pagination
 */
router.get('/', documentController.getUserDocuments);

/**
 * @swagger
 * /api/documents/{id}:
 *   get:
 *     summary: Get document details by ID
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Document details
 *       404:
 *         description: Document not found
 */
router.get('/:id', documentController.getDocumentById);

/**
 * @swagger
 * /api/documents/{id}:
 *   put:
 *     summary: Update document metadata or visibility
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               visibility:
 *                 type: string
 *                 enum: [PUBLIC, PRIVATE]
 *               metadata:
 *                 type: object
 *     responses:
 *       200:
 *         description: Document updated successfully
 *       404:
 *         description: Document not found
 */
router.put('/:id', documentController.updateDocument);

export default router;
