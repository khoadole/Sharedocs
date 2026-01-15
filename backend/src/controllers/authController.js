import authService from '../services/authService.js';

class AuthController {
  /**
   * Register a new user
   * POST /api/auth/register
   */
  async register(req, res) {
    try {
      const { email, password, walletAddress, fullName, role } = req.body;

      // Validate required fields
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Email and password are required'
        });
      }

      // Register user
      const user = await authService.register({
        email,
        password,
        walletAddress, // Optional
        fullName,
        role // Optional, defaults to 'USER' in service
      });

      return res.status(201).json({
        success: true,
        message: 'User registered successfully',
        user: {
          id: user.id,
          email: user.email,
          walletAddress: user.wallet_address,
          fullName: user.full_name,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Register error:', error);

      // Handle specific errors
      if (error.message.includes('already registered') ||
        error.message.includes('Invalid wallet address') ||
        error.message.includes('must be at least')) {
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }

      return res.status(500).json({
        success: false,
        error: 'Registration failed. Please try again.'
      });
    }
  }

  /**
   * Login with email and password
   * POST /api/auth/login
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validate inputs
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Email and password are required'
        });
      }

      // Login user
      const user = await authService.login(email, password);

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          walletAddress: user.wallet_address,
          fullName: user.full_name,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Login error:', error);

      // Handle authentication errors
      if (error.message.includes('Invalid email or password') ||
        error.message.includes('wallet login only')) {
        return res.status(401).json({
          success: false,
          error: error.message
        });
      }

      return res.status(500).json({
        success: false,
        error: 'Login failed. Please try again.'
      });
    }
  }

  /**
   * Login with wallet address (simplified for demo)
   * POST /api/auth/login/wallet
   */
  async loginWithWallet(req, res) {
    try {
      const { walletAddress } = req.body;

      // Validate wallet address
      if (!walletAddress) {
        return res.status(400).json({
          success: false,
          error: 'Wallet address is required'
        });
      }

      // Login with wallet
      const user = await authService.loginWithWallet(walletAddress);

      return res.status(200).json({
        success: true,
        message: 'Wallet login successful',
        user: {
          id: user.id,
          email: user.email,
          walletAddress: user.wallet_address,
          fullName: user.full_name,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Wallet login error:', error);

      if (error.message.includes('not registered') ||
        error.message.includes('Invalid wallet address')) {
        return res.status(404).json({
          success: false,
          error: error.message
        });
      }

      return res.status(500).json({
        success: false,
        error: 'Wallet login failed. Please try again.'
      });
    }
  }

  /**
   * Connect wallet to existing user account
   * PUT /api/auth/wallet
   */
  async connectWallet(req, res) {
    try {
      const { userId, walletAddress } = req.body;

      // Validate inputs
      if (!userId || !walletAddress) {
        return res.status(400).json({
          success: false,
          error: 'User ID and wallet address are required'
        });
      }

      // Connect wallet
      const user = await authService.connectWallet(userId, walletAddress);

      return res.status(200).json({
        success: true,
        message: user.role === 'UPLOADER'
          ? 'Wallet connected successfully! You can now upload documents.'
          : 'Wallet connected successfully',
        user: {
          id: user.id,
          email: user.email,
          walletAddress: user.wallet_address,
          fullName: user.full_name,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Connect wallet error:', error);

      if (error.message.includes('already connected') ||
        error.message.includes('Invalid wallet address')) {
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }

      return res.status(500).json({
        success: false,
        error: 'Failed to connect wallet. Please try again.'
      });
    }
  }

  async getCurrentUser(req, res) {
    try {
      return res.status(200).json({
        success: true,
        message: 'This endpoint requires authentication middleware',
        user: null
      });
    } catch (error) {
      console.error('Get current user error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to get user information'
      });
    }
  }

  async healthCheck(req, res) {
    return res.status(200).json({
      success: true,
      message: 'Auth service is running',
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Forgot password request
   * POST /api/auth/forgot-password
   */
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ success: false, error: 'Email is required' });
      }

      await authService.forgotPassword(email);

      // Always return success to prevent email enumeration
      return res.status(200).json({
        success: true,
        message: 'If an account exists with that email, a password reset link has been sent.'
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      return res.status(500).json({ success: false, error: 'Failed to process request' });
    }
  }

  /**
   * Reset password request
   * POST /api/auth/reset-password
   */
  async resetPassword(req, res) {
    try {
      const { token, password, confirmPassword } = req.body;

      if (!token || !password) {
        return res.status(400).json({ success: false, error: 'Token and password are required' });
      }

      if (password !== confirmPassword) {
        return res.status(400).json({ success: false, error: 'Passwords do not match' });
      }

      await authService.resetPassword(token, password);

      return res.status(200).json({
        success: true,
        message: 'Password reset successful. You can now sign in with your new password.'
      });
    } catch (error) {
      console.error('Reset password error:', error);
      if (error.message.includes('Invalid or expired') || error.message.includes('expired')) {
        return res.status(400).json({ success: false, error: error.message });
      }
      return res.status(500).json({ success: false, error: 'Failed to reset password' });
    }
  }
}

export default new AuthController();
