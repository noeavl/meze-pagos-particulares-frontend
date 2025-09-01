import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserRepository } from '../../domain/repositories/user.repository';
import { User, ApiUserResponse, ApiResponse, CreateUserDto, UpdateUserDto, UpdateUserEstadoDto } from '../../domain/entities/user.entity';
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

  getUserById(id: number): Observable<User> {
    return this.http
      .get<ApiResponse<ApiUserResponse>>(API_ENDPOINTS.usuarios.getById(id))
      .pipe(
        map((response) => this.mapToDomain(response.data))
      );
  }

  createUser(userData: CreateUserDto): Observable<User> {
    return this.http
      .post<ApiResponse<ApiUserResponse>>(API_ENDPOINTS.usuarios.create, userData)
      .pipe(
        map((response) => this.mapToDomain(response.data))
      );
  }

  updateUser(id: number, userData: UpdateUserDto): Observable<User> {
    return this.http
      .put<ApiResponse<ApiUserResponse>>(API_ENDPOINTS.usuarios.update(id), userData)
      .pipe(
        map((response) => this.mapToDomain(response.data))
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

  updateEstado(id: number, estado: boolean): Observable<any> {
    const updateData: UpdateUserEstadoDto = { estado };
    return this.http.put<any>(`${API_ENDPOINTS.USUARIOS}/actualizarEstado/${id}`, updateData);
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
      estado: Boolean(apiUser.estado),
      createdAt: new Date(apiUser.created_at),
      updatedAt: new Date(apiUser.updated_at),
    };
  }
}