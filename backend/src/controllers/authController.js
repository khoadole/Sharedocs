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
}

export default new AuthController();
