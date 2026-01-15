import { query } from '../db/config.js';

class UserService {
  /**
   * Create a new user
   * @param {Object} userData - User data
   * @returns {Promise<Object>} Created user
   */
  async createUser({ walletAddress, email, passwordHash, fullName, role = 'USER' }) {
    const sql = `
      INSERT INTO users (wallet_address, email, password_hash, full_name, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, wallet_address, email, full_name, role, created_at, updated_at
    `;
    
    const values = [walletAddress, email, passwordHash, fullName, role];
    const result = await query(sql, values);
    
    return result.rows[0];
  }

  /**
   * Find user by email
   * @param {string} email - User email
   * @returns {Promise<Object|null>} User or null
   */
  async findByEmail(email) {
    const sql = `
      SELECT id, wallet_address, email, password_hash, full_name, role, created_at, updated_at
      FROM users
      WHERE email = $1
    `;
    
    const result = await query(sql, [email]);
    return result.rows[0] || null;
  }

  /**
   * Find user by wallet address
   * @param {string} walletAddress - Ethereum wallet address
   * @returns {Promise<Object|null>} User or null
   */
  async findByWalletAddress(walletAddress) {
    const sql = `
      SELECT id, wallet_address, email, password_hash, full_name, role, created_at, updated_at
      FROM users
      WHERE wallet_address = $1
    `;
    
    const result = await query(sql, [walletAddress]);
    return result.rows[0] || null;
  }

  /**
   * Find user by ID
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>} User or null
   */
  async findById(userId) {
    const sql = `
      SELECT id, wallet_address, email, full_name, role, created_at, updated_at
      FROM users
      WHERE id = $1
    `;
    
    const result = await query(sql, [userId]);
    return result.rows[0] || null;
  }

  /**
   * Check if email exists
   * @param {string} email - Email to check
   * @returns {Promise<boolean>}
   */
  async emailExists(email) {
    const sql = `SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)`;
    const result = await query(sql, [email]);
    return result.rows[0].exists;
  }

  /**
   * Check if wallet address exists
   * @param {string} walletAddress - Wallet address to check
   * @returns {Promise<boolean>}
   */
  async walletExists(walletAddress) {
    const sql = `SELECT EXISTS(SELECT 1 FROM users WHERE wallet_address = $1)`;
    const result = await query(sql, [walletAddress]);
    return result.rows[0].exists;
  }

  /**
   * Update user information
   * @param {string} userId - User ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated user
   */
  async updateUser(userId, updates) {
    const allowedFields = ['email', 'full_name', 'password_hash', 'wallet_address', 'role'];
    const fields = [];
    const values = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key) && value !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    }

    if (fields.length === 0) {
      throw new Error('No valid fields to update');
    }

    fields.push(`updated_at = NOW()`);
    values.push(userId);

    const sql = `
      UPDATE users
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, wallet_address, email, full_name, role, created_at, updated_at
    `;

    const result = await query(sql, values);
    return result.rows[0];
  }

  /**
   * Format user object (remove sensitive data)
   * @param {Object} user - User object
   * @returns {Object} Formatted user
   */
  formatUser(user) {
    if (!user) return null;
    
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

export default new UserService();
