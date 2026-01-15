-- Create document visibility enum
CREATE TYPE document_visibility AS ENUM ('PUBLIC', 'PRIVATE');

-- Create documents table
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    document_hash VARCHAR(66) UNIQUE NOT NULL,
    ipfs_cid VARCHAR(255) NOT NULL,
    filename VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    file_type VARCHAR(100),
    metadata JSONB,
    blockchain_tx_hash VARCHAR(66),
    blockchain_timestamp BIGINT,
    visibility document_visibility DEFAULT 'PRIVATE',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT chk_hash_format CHECK (document_hash ~ '^0x[a-fA-F0-9]{64}$'),
    CONSTRAINT chk_file_size CHECK (file_size > 0)
);

-- Create indexes for performance
CREATE INDEX idx_documents_user ON documents(user_id);
CREATE INDEX idx_documents_hash ON documents(document_hash);
CREATE INDEX idx_documents_visibility ON documents(visibility);
CREATE INDEX idx_documents_created ON documents(created_at DESC);
CREATE INDEX idx_documents_filename ON documents USING gin(to_tsvector('english', filename));

-- Create verification logs table
CREATE TYPE verification_method AS ENUM ('FILE', 'HASH');

CREATE TABLE verification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
    verified_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    verification_method verification_method NOT NULL,
    verification_result BOOLEAN NOT NULL,
    attempted_hash VARCHAR(66),
    verified_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for verification logs
CREATE INDEX idx_verifications_document ON verification_logs(document_id);
CREATE INDEX idx_verifications_user ON verification_logs(verified_by_user_id);
CREATE INDEX idx_verifications_timestamp ON verification_logs(verified_at DESC);
