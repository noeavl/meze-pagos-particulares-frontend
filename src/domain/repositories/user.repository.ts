import { Observable } from 'rxjs';
import { User, CreateUserDto, UpdateUserDto } from '../entities/user.entity';

export abstract class UserRepository {
  abstract getAllUsers(): Observable<User[]>;
  abstract getUserById(id: number): Observable<User>;
  abstract createUser(userData: CreateUserDto): Observable<User>;
  abstract updateUser(id: number, userData: UpdateUserDto): Observable<User>;
  abstract searchUsers(term: string): Observable<User[]>;
  abstract updateEstado(id: number, estado: boolean): Observable<any>;
}