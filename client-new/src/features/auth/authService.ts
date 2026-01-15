import type { RegisterData, LoginData, ApiResponse } from '@/types/auth/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Register new user (email + password required)
export async function registerUser(data: RegisterData): Promise<ApiResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Registration failed');
    }

    return result;
  } catch (error) {
    console.error('Register error:', error);
    throw error;
  }
}

// Login with email and password
export async function loginUser(data: LoginData): Promise<ApiResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Login failed');
    }

    return result;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

// Connect wallet to existing account (upgrades USER to UPLOADER)
export async function connectWallet(userId: string, walletAddress: string): Promise<ApiResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/wallet`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, walletAddress }),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to connect wallet');
    }

    return result;
  } catch (error) {
    console.error('Connect wallet error:', error);
    throw error;
  }
}
