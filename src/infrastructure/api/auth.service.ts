import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AuthRepository } from '../../domain/repositories/auth.repository';
import { AuthUser, ApiCurrentUserResponse } from '../../domain/entities/user.entity';
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
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    const token = localStorage.getItem('token');

    if (!token) {
      return null;
    }

    try {
      const response = await this.http
        .get<ApiCurrentUserResponse>(API_ENDPOINTS.USER)
        .pipe(catchError(this.handleError))
        .toPromise() as ApiCurrentUserResponse;

      if (response) {
        return {
          id: response.id.toString(),
          email: response.email,
          name: response.name,
          role: response.role,
          token,
        };
      }

      return null;
    } catch (error) {
      console.error('Error getting current user:', error);
      // Si falla la llamada, limpiar el token inválido
      localStorage.removeItem('token');
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
