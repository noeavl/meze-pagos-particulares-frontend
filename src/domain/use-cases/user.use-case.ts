import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserRepository } from '../repositories/user.repository';
import { User, CreateUserDto, UpdateUserDto } from '../entities/user.entity';

@Injectable()
export class UserUseCase {
  constructor(private userRepository: UserRepository) {}

  getAllUsers(): Observable<User[]> {
    return this.userRepository.getAllUsers();
  }

  getUserById(id: number): Observable<User> {
    return this.userRepository.getUserById(id);
  }

  createUser(userData: CreateUserDto): Observable<User> {
    return this.userRepository.createUser(userData);
  }

  updateUser(id: number, userData: UpdateUserDto): Observable<User> {
    return this.userRepository.updateUser(id, userData);
  }

  searchUsers(term: string): Observable<User[]> {
    return this.userRepository.searchUsers(term);
  }

  updateUserEstado(id: number, estado: boolean): Observable<any> {
    return this.userRepository.updateEstado(id, estado);
  }
}