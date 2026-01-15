// Document-related type definitions

export interface Document {
  id: string;
  user_id: string;
  document_hash: string;
  ipfs_cid: string;
  filename: string;
  file_size: number;
  file_type: string;
  metadata: any;
  blockchain_tx_hash: string;
  blockchain_timestamp: number;
  visibility: 'PUBLIC' | 'PRIVATE';
  created_at: string;
  updated_at: string;
  verification_count?: number;
}

export interface CreateDocumentData {
  userId: string;
  documentHash: string;
  ipfsCid: string;
  filename: string;
  fileSize: number;
  fileType: string;
  metadata?: any;
  blockchainTxHash?: string;
  blockchainTimestamp?: number;
  visibility?: 'PUBLIC' | 'PRIVATE';
}

export interface DocumentsResponse {
  success: boolean;
  documents: Document[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface DocumentResponse {
  success: boolean;
  document: Document;
}
