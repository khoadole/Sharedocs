-- Migration: Add reset password fields to users table
-- Date: 2026-01-15

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS reset_password_token VARCHAR(255),
ADD COLUMN IF NOT EXISTS reset_password_expires TIMESTAMP;

-- Create index for token lookups
CREATE INDEX IF NOT EXISTS idx_users_reset_password_token ON users(reset_password_token);

-- Display success message
SELECT 'Reset password fields added successfully!' AS message;
