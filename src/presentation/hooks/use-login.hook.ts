import { Injectable, signal, computed, inject } from '@angular/core';
import { LoginUseCase } from '../../domain/use-cases/login.use-case';
import { AuthService } from '../../infrastructure/api/auth.service';
import { LoginCredentials } from '../../shared/types/auth.types';
import { User } from '../../domain/entities/user.entity';

@Injectable({
  providedIn: 'root'
})
export class useLogin {
  private authService = inject(AuthService);
  private loginUseCase = new LoginUseCase(this.authService);

  private _isLoading = signal(false);
  private _error = signal<string | null>(null);
  private _user = signal<User | null>(null);

  isLoading = this._isLoading.asReadonly();
  error = this._error.asReadonly();
  user = this._user.asReadonly();
  isAuthenticated = computed(() => this._user() !== null);

  async login(credentials: LoginCredentials) {
    try {
      this._isLoading.set(true);
      this._error.set(null);

      const response = await this.loginUseCase.execute(credentials);
      this._user.set({
        id: response.data.user.id.toString(),
        email: response.data.user.email,
        name: response.data.user.name,
        token: response.data.token,
      });

      return response;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error desconocido';
      this._error.set(errorMessage);
      throw err;
    } finally {
      this._isLoading.set(false);
    }
  }

  async logout() {
    try {
      await this.authService.logout();
      this._user.set(null);
      this._error.set(null);
    } catch (err) {
      console.error('Error during logout:', err);
    }
  }

  async checkCurrentUser() {
    try {
      const currentUser = await this.authService.getCurrentUser();
      this._user.set(currentUser);
    } catch (err) {
      console.error('Error checking current user:', err);
    }
  }
}
