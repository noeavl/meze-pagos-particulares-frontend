import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AuthRepository } from '../../domain/repositories/auth.repository';
import { AuthUser } from '../../domain/entities/user.entity';
import { LoginCredentials, LoginResponse } from '../../shared/types/auth.types';
import { API_ENDPOINTS } from '../../shared/constants/api.constants';

@Injectable({
  providedIn: 'root',
})
export class AuthService implements AuthRepository {
  constructor(private http: HttpClient) {}

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = (await this.http
        .post<LoginResponse>(`${API_ENDPOINTS.AUTH}/login`, credentials)
        .pipe(catchError(this.handleError))
        .toPromise()) as LoginResponse;

      if (response && response.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        return response;
      }

      throw new Error(response?.message || 'Login fallido');
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Error de conexión'
      );
    }
  }

  async logout(): Promise<void> {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    const token = localStorage.getItem('token');
    const userString = localStorage.getItem('user');

    if (!token || !userString) {
      return null;
    }

    try {
      const user = JSON.parse(userString);
      return {
        id: user.id.toString(),
        email: user.email,
        name: user.name,
        token,
      };
    } catch {
      return null;
    }
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Error desconocido';

    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      errorMessage =
        error.error?.message || `Error ${error.status}: ${error.statusText}`;
    }

    return throwError(() => new Error(errorMessage));
  }
}
