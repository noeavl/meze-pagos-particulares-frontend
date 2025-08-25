import { AuthRepository } from '../repositories/auth.repository';
import { LoginCredentials, LoginResponse } from '../../shared/types/auth.types';

export class LoginUseCase {
  constructor(private authRepository: AuthRepository) {}

  async execute(credentials: LoginCredentials): Promise<LoginResponse> {
    if (!credentials.email || !credentials.password) {
      throw new Error('Email y contraseña son requeridos');
    }

    if (!this.isValidEmail(credentials.email)) {
      throw new Error('Email no válido');
    }

    return await this.authRepository.login(credentials);
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}