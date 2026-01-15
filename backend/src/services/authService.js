import bcrypt from 'bcrypt';
import crypto from 'crypto';
import userService from './userService.js';
import emailService from './emailService.js';

const SALT_ROUNDS = 10;

class AuthService {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Created user
   */
  async register({ email, password, walletAddress, fullName, role }) {
    // Validate required fields - email and password are now required
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    // Validate password strength
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    // Check if email already exists
    const emailExists = await userService.emailExists(email);
    if (emailExists) {
      throw new Error('Email already registered');
    }

    // If wallet address provided, validate and check it
    if (walletAddress) {
      // Validate wallet address format (optional validation)
      // if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      //   throw new Error('Invalid wallet address format');
      // }

      const walletExists = await userService.walletExists(walletAddress);
      if (walletExists) {
        throw new Error('Wallet address already registered');
      }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user with specified role or default to USER
    const user = await userService.createUser({
      walletAddress: walletAddress || null,
      email,
      passwordHash,
      fullName: fullName || null,
      role: role || 'USER'
    });

    return userService.formatUser(user);
  }

  /**
   * Login user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} User object
   */
  async login(email, password) {
    // Validate inputs
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    // Find user by email
    const user = await userService.findByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check if user has a password (some users might only use wallet login)
    if (!user.password_hash) {
      throw new Error('This account uses wallet login only');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    return userService.formatUser(user);
  }

  /**
   * Connect wallet to existing user account
   * @param {string} userId - User ID
   * @param {string} walletAddress - Ethereum wallet address
   * @returns {Promise<Object>} Updated user object
   */
  async connectWallet(userId, walletAddress) {
    // Validate wallet address format (optional for demo)
    // if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
    //   throw new Error('Invalid wallet address format');
    // }

    // Check if wallet is already used by another user
    const existingUser = await userService.findByWalletAddress(walletAddress);
    if (existingUser && existingUser.id !== userId) {
      throw new Error('Wallet address already connected to another account');
    }

    // Get current user to check role
    const currentUser = await userService.findById(userId);
    if (!currentUser) {
      throw new Error('User not found');
    }

    // Update user with wallet address only (do not change role)
    const updates = {
      wallet_address: walletAddress
    };

    const updatedUser = await userService.updateUser(userId, updates);

    return userService.formatUser(updatedUser);
  }

  /**
   * Login user with wallet address (simplified for demo)
   * @param {string} walletAddress - Ethereum wallet address
   * @returns {Promise<Object>} User object
   */
  async loginWithWallet(walletAddress) {
    // Validate wallet address format (optional for demo)
    // if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
    //   throw new Error('Invalid wallet address format');
    // }

    // Find user by wallet address
    const user = await userService.findByWalletAddress(walletAddress);
    if (!user) {
      throw new Error('Wallet address not registered');
    }

    return userService.formatUser(user);
  }

  /**
   * Verify password strength
   * @param {string} password - Password to verify
   * @returns {Object} Validation result
   */
  validatePassword(password) {
    const minLength = 6;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const isValid = password.length >= minLength;

    return {
      isValid,
      strength: isValid ? (hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar ? 'strong' : 'medium') : 'weak',
      suggestions: [
        password.length < minLength ? `Use at least ${minLength} characters` : null,
        !hasUpperCase ? 'Add uppercase letters' : null,
        !hasNumbers ? 'Add numbers' : null,
        !hasSpecialChar ? 'Add special characters' : null
      ].filter(Boolean)
    };
  }

  /**
   * Handle forgot password request
   * @param {string} email - User email
   */
  async forgotPassword(email) {
    console.log(`[DEBUG] Forgot password request for: ${email}`);
    const user = await userService.findByEmail(email);
    if (!user) {
      console.log(`[DEBUG] Email not found in database: ${email}`);
      throw new Error('Email not registered');
    }

    console.log(`[DEBUG] Generating reset token for user: ${user.id}`);
    // Generate random token
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date();
    expires.setHours(expires.getHours() + 1); // 1 hour expiry

    // Save token to user
    await userService.updateUser(user.id, {
      reset_password_token: token,
      reset_password_expires: expires
    });

    console.log(`[DEBUG] Reset token saved to database`);

    // Send email
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetLink = `${clientUrl}/reset-password?token=${token}`;
    await emailService.sendResetPasswordEmail(user.email, resetLink);
  }

  /**
   * Reset password using token
   * @param {string} token - Reset token
   * @param {string} newPassword - New password
   */
  async resetPassword(token, newPassword) {
    // Find user by token and ensure it's not expired
    const sql = `
      SELECT id, reset_password_expires 
      FROM users 
      WHERE reset_password_token = $1
    `;
    const result = await userService.query(sql, [token]);
    const user = result.rows[0];

    if (!user) {
      throw new Error('Invalid or expired reset token');
    }

    if (new Date() > new Date(user.reset_password_expires)) {
      throw new Error('Reset token has expired');
    }

    // Validate password strength
    if (newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // Update user password and clear token
    await userService.updateUser(user.id, {
      password_hash: passwordHash,
      reset_password_token: null,
      reset_password_expires: null
    });
  }
}

export default new AuthService();
