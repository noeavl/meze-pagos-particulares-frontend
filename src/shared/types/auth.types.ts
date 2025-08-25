export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: number;
      name: string;
      email: string;
    };
    token: string;
    token_type: string;
  };
}

export interface AuthError {
  message: string;
  code?: string;
}