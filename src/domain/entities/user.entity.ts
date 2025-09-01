// Interface for authentication purposes (backward compatibility)
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  token?: string;
}

// Interface for the API response from /user endpoint
export interface ApiCurrentUserResponse {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  role: string;
  estado: number;
  created_at: string;
  updated_at: string;
}

// Complete User interface for the users management
export interface User {
  id: number;
  name: string;
  email: string;
  emailVerifiedAt: Date | null;
  role: string;
  estado: boolean;
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
  estado: number;
  created_at: string;
  updated_at: string;
}

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface UpdateUserDto {
  name: string;
  email: string;
  password?: string;
  password_confirmation?: string;
}

export interface UpdateUserEstadoDto {
  estado: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: {
    [key: string]: string[];
  };
}