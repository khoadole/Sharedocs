import type { User } from '@/types/auth/types';

// Store user in localStorage
export function saveUser(user: User): void {
  localStorage.setItem('user', JSON.stringify(user));
}

// Get user from localStorage
export function getUser(): User | null {
  const userData = localStorage.getItem('user');
  if (!userData) return null;
  
  try {
    return JSON.parse(userData);
  } catch {
    return null;
  }
}

// Remove user from localStorage
export function removeUser(): void {
  localStorage.removeItem('user');
}

// Check if user is logged in
export function isAuthenticated(): boolean {
  return getUser() !== null;
}

// Check if user has uploader role
export function canUpload(): boolean {
  const user = getUser();
  return user?.role === 'UPLOADER';
}
