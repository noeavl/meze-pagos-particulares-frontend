// Interface for authentication purposes (backward compatibility)
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  token?: string;
}

// Complete User interface for the users management
export interface User {
  id: number;
  name: string;
  email: string;
  emailVerifiedAt: Date | null;
  role: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  token?: string;
}

export interface ApiUserResponse {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  role: string;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}