export interface RegisterData {
  email: string;
  password: string;
  fullName?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  walletAddress: string | null;
  fullName: string | null;
  role: 'USER' | 'UPLOADER';
}

export interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
  user?: User;
}

export interface ConnectWalletData {
  userId: string;
  walletAddress: string;
}
