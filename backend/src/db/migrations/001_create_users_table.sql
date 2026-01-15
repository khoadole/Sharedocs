-- Migration: Create users table
-- Date: 2026-01-15

-- Create user role enum (skip if exists)
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('USER', 'UPLOADER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_address VARCHAR(42) UNIQUE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'USER',
    full_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT chk_wallet_format CHECK (wallet_address IS NULL OR wallet_address ~ '^0x[a-fA-F0-9]{40}$')
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_wallet ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Display success message
SELECT 'Users table created successfully!' AS message;
