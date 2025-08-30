import { Observable } from 'rxjs';
import { User } from '../entities/user.entity';

export abstract class UserRepository {
  abstract getAllUsers(): Observable<User[]>;
  abstract searchUsers(term: string): Observable<User[]>;
}