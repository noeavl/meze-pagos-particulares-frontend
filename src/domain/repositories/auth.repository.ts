import { User } from '../entities/user.entity';
import { LoginCredentials, LoginResponse } from '../../shared/types/auth.types';

export interface AuthRepository {
  login(credentials: LoginCredentials): Promise<LoginResponse>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
}