import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserRepository } from '../../domain/repositories/user.repository';
import { User, ApiUserResponse, ApiResponse } from '../../domain/entities/user.entity';
import { API_ENDPOINTS } from '../../shared/constants/api.constants';

@Injectable()
export class UserService extends UserRepository {
  constructor(private http: HttpClient) {
    super();
  }

  getAllUsers(): Observable<User[]> {
    return this.http
      .get<ApiResponse<ApiUserResponse[]>>(API_ENDPOINTS.usuarios.getAll)
      .pipe(
        map((response) => response.data.map((user) => this.mapToDomain(user)))
      );
  }

  searchUsers(term: string): Observable<User[]> {
    return this.http
      .get<ApiResponse<ApiUserResponse[]>>(
        `${API_ENDPOINTS.usuarios.search}?q=${encodeURIComponent(term)}`
      )
      .pipe(
        map((response) => response.data.map((user) => this.mapToDomain(user)))
      );
  }

  private mapToDomain(apiUser: ApiUserResponse): User {
    return {
      id: apiUser.id,
      name: apiUser.name,
      email: apiUser.email,
      emailVerifiedAt: apiUser.email_verified_at 
        ? new Date(apiUser.email_verified_at) 
        : null,
      role: apiUser.role,
      isActive: Boolean(apiUser.is_active),
      createdAt: new Date(apiUser.created_at),
      updatedAt: new Date(apiUser.updated_at),
    };
  }
}