import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserRepository } from '../repositories/user.repository';
import { User } from '../entities/user.entity';

@Injectable()
export class UserUseCase {
  constructor(private userRepository: UserRepository) {}

  getAllUsers(): Observable<User[]> {
    return this.userRepository.getAllUsers();
  }

  searchUsers(term: string): Observable<User[]> {
    return this.userRepository.searchUsers(term);
  }
}