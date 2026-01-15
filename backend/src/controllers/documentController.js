import * as documentService from '../services/documentService.js';

/**
 * POST /api/documents
 * Create document record after blockchain upload
 */
export async function createDocument(req, res) {
  try {
    const {
      documentHash,
      ipfsCid,
      filename,
      fileSize,
      fileType,
      metadata,
      blockchainTxHash,
      blockchainTimestamp,
      visibility
    } = req.body;

    // Validate required fields
    if (!documentHash || !ipfsCid || !filename || !fileSize) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: documentHash, ipfsCid, filename, fileSize'
      });
    }

    // Validate hash format (0x + 64 hex chars)
    if (!/^0x[a-fA-F0-9]{64}$/.test(documentHash)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid document hash format. Expected: 0x followed by 64 hexadecimal characters'
      });
    }

    // Check if document already exists
    const exists = await documentService.documentExists(documentHash);
    if (exists) {
      return res.status(409).json({
        success: false,
        message: 'Document with this hash already exists'
      });
    }

    // Get user ID from request body or headers (for demo without auth)
    const userId = req.body.userId || req.headers['x-user-id'];
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId is required (provide in body or x-user-id header)'
      });
    }

    // Create document
    const document = await documentService.createDocument({
      userId,
      documentHash,
      ipfsCid,
      filename,
      fileSize,
      fileType,
      metadata,
      blockchainTxHash,
      blockchainTimestamp,
      visibility
    });

    res.status(201).json({
      success: true,
      document
    });
  } catch (error) {
    console.error('Create document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create document record',
      error: error.message
    });
  }
}

/**
 * GET /api/documents
 * Get user's documents with search and filter
 */
export async function getUserDocuments(req, res) {
  try {
    // Get user ID from query or headers (for demo without auth)
    const userId = req.query.userId || req.headers['x-user-id'];
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId is required (provide in query or x-user-id header)'
      });
    }

    const {
      search = '',
      fileType = null,
      visibility = null,
      sortBy = 'created_at',
      order = 'DESC',
      page = 1,
      limit = 20
    } = req.query;

    // Validate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    if (isNaN(pageNum) || pageNum < 1) {
      return res.status(400).json({
        success: false,
        message: 'Invalid page number'
      });
    }

    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        success: false,
        message: 'Invalid limit. Must be between 1 and 100'
      });
    }

    const result = await documentService.getUserDocuments({
      userId,
      search,
      fileType,
      visibility,
      sortBy,
      order,
      page: pageNum,
      limit: limitNum
    });

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch documents',
      error: error.message
    });
  }
}

/**
 * GET /api/documents/:id
 * Get document details by ID
 */
export async function getDocumentById(req, res) {
  try {
    const { id } = req.params;
    // Get user ID from query or headers (for demo without auth)
    const userId = req.query.userId || req.headers['x-user-id'];
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId is required (provide in query or x-user-id header)'
      });
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid document ID format'
      });
    }

    const document = await documentService.getDocumentById(id, userId);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    res.json({
      success: true,
      document
    });
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch document',
      error: error.message
    });
  }
}

/**
 * PUT /api/documents/:id
 * Update document metadata or visibility
 */
export async function updateDocument(req, res) {
  try {
    const { id } = req.params;
    const { visibility, metadata } = req.body;
    // Get user ID from body or headers (for demo without auth)
    const userId = req.body.userId || req.headers['x-user-id'];
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId is required (provide in body or x-user-id header)'
      });
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid document ID format'
      });
    }

    // Validate visibility if provided
    if (visibility && !['PUBLIC', 'PRIVATE'].includes(visibility)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid visibility value. Must be PUBLIC or PRIVATE'
      });
    }

    const updates = {};
    if (visibility !== undefined) updates.visibility = visibility;
    if (metadata !== undefined) updates.metadata = metadata;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }

    const document = await documentService.updateDocument(id, userId, updates);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    res.json({
      success: true,
      document
    });
  } catch (error) {
    console.error('Update document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update document',
      error: error.message
    });
  }
}
