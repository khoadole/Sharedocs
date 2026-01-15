import pool from '../db/config.js';

/**
 * Create a new document record after blockchain upload
 */
export async function createDocument({
  userId,
  documentHash,
  ipfsCid,
  filename,
  fileSize,
  fileType,
  metadata,
  blockchainTxHash,
  blockchainTimestamp,
  visibility = 'PRIVATE'
}) {
  const query = `
    INSERT INTO documents (
      user_id, document_hash, ipfs_cid, filename, file_size, 
      file_type, metadata, blockchain_tx_hash, blockchain_timestamp, visibility
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *
  `;

  const values = [
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
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
}

/**
 * Get all documents for a user with search and filter
 */
export async function getUserDocuments({
  userId,
  search = '',
  fileType = null,
  visibility = null,
  sortBy = 'created_at',
  order = 'DESC',
  page = 1,
  limit = 20
}) {
  const offset = (page - 1) * limit;
  const conditions = ['user_id = $1'];
  const values = [userId];
  let paramCount = 1;

  // Add search filter
  if (search) {
    paramCount++;
    conditions.push(`(
      filename ILIKE $${paramCount} OR 
      document_hash ILIKE $${paramCount}
    )`);
    values.push(`%${search}%`);
  }

  // Add file type filter
  if (fileType) {
    paramCount++;
    conditions.push(`file_type = $${paramCount}`);
    values.push(fileType);
  }

  // Add visibility filter
  if (visibility) {
    paramCount++;
    conditions.push(`visibility = $${paramCount}`);
    values.push(visibility);
  }

  const whereClause = conditions.join(' AND ');

  // Validate sortBy to prevent SQL injection
  const allowedSortColumns = ['created_at', 'filename', 'file_size', 'updated_at'];
  const sortColumn = allowedSortColumns.includes(sortBy) ? sortBy : 'created_at';
  const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  // Get total count
  const countQuery = `SELECT COUNT(*) FROM documents WHERE ${whereClause}`;
  const countResult = await pool.query(countQuery, values);
  const total = parseInt(countResult.rows[0].count);

  // Get paginated results
  const query = `
    SELECT 
      id, user_id, document_hash, ipfs_cid, filename, file_size, 
      file_type, metadata, blockchain_tx_hash, blockchain_timestamp, 
      visibility, created_at, updated_at
    FROM documents
    WHERE ${whereClause}
    ORDER BY ${sortColumn} ${sortOrder}
    LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
  `;

  values.push(limit, offset);

  const result = await pool.query(query, values);

  return {
    documents: result.rows,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
}

/**
 * Get a single document by ID
 */
export async function getDocumentById(documentId, userId) {
  const query = `
    SELECT 
      d.*,
      (SELECT COUNT(*) FROM verification_logs WHERE document_id = d.id) as verification_count
    FROM documents d
    WHERE d.id = $1 AND d.user_id = $2
  `;

  const result = await pool.query(query, [documentId, userId]);

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
}

/**
 * Get document by hash (for verification)
 */
export async function getDocumentByHash(documentHash) {
  const query = `
    SELECT 
      d.*,
      u.wallet_address as uploader_wallet,
      u.full_name as uploader_name,
      (SELECT COUNT(*) FROM verification_logs WHERE document_id = d.id) as verification_count
    FROM documents d
    LEFT JOIN users u ON d.user_id = u.id
    WHERE d.document_hash = $1
  `;

  const result = await pool.query(query, [documentHash]);

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
}

/**
 * Update document metadata or visibility
 */
export async function updateDocument(documentId, userId, updates) {
  const allowedFields = ['visibility', 'metadata'];
  const setClause = [];
  const values = [];
  let paramCount = 0;

  for (const [key, value] of Object.entries(updates)) {
    if (allowedFields.includes(key) && value !== undefined) {
      paramCount++;
      setClause.push(`${key} = $${paramCount}`);
      values.push(key === 'metadata' ? JSON.stringify(value) : value);
    }
  }

  if (setClause.length === 0) {
    throw new Error('No valid fields to update');
  }

  // Add updated_at
  paramCount++;
  setClause.push(`updated_at = $${paramCount}`);
  values.push(new Date());

  // Add WHERE conditions
  paramCount++;
  values.push(documentId);
  paramCount++;
  values.push(userId);

  const query = `
    UPDATE documents
    SET ${setClause.join(', ')}
    WHERE id = $${paramCount - 1} AND user_id = $${paramCount}
    RETURNING *
  `;

  const result = await pool.query(query, values);

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
}

/**
 * Log a verification attempt
 */
export async function logVerification({
  documentId = null,
  verifiedByUserId = null,
  verificationMethod,
  verificationResult,
  attemptedHash
}) {
  const query = `
    INSERT INTO verification_logs (
      document_id, verified_by_user_id, verification_method, 
      verification_result, attempted_hash
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;

  const values = [
    documentId,
    verifiedByUserId,
    verificationMethod,
    verificationResult,
    attemptedHash
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
}

/**
 * Check if document hash already exists
 */
export async function documentExists(documentHash) {
  const query = 'SELECT id FROM documents WHERE document_hash = $1';
  const result = await pool.query(query, [documentHash]);
  return result.rows.length > 0;
}
