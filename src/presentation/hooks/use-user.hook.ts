import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { UserUseCase } from '../../domain/use-cases/user.use-case';
import { User, CreateUserDto, UpdateUserDto } from '../../domain/entities/user.entity';

@Injectable({
  providedIn: 'root',
})
export class useUser {
  usuarios = signal<User[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  constructor(private userUseCase: UserUseCase) {}

  loadUsers() {
    this.loading.set(true);
    this.error.set(null);

    this.userUseCase
      .getAllUsers()
      .pipe(
        catchError((err) => {
          this.error.set('Error al cargar usuarios: ' + err.message);
          return of([]);
        }),
        finalize(() => this.loading.set(false))
      )
      .subscribe((usuarios) => {
        this.usuarios.set(usuarios);
      });
  }

  getUserById(id: number): Observable<User> {
    this.loading.set(true);
    this.error.set(null);

    return this.userUseCase
      .getUserById(id)
      .pipe(
        catchError((err) => {
          this.error.set('Error al cargar usuario: ' + err.message);
          throw err;
        }),
        finalize(() => this.loading.set(false))
      );
  }

  createUser(userData: CreateUserDto): Observable<User> {
    this.loading.set(true);
    this.error.set(null);

    return this.userUseCase
      .createUser(userData)
      .pipe(
        tap((newUser) => {
          // Agregar el nuevo usuario a la lista local
          const currentUsers = this.usuarios();
          this.usuarios.set([...currentUsers, newUser]);
        }),
        catchError((err) => {
          this.error.set('Error al crear usuario: ' + err.message);
          throw err; // Re-throw to allow component to handle it
        }),
        finalize(() => this.loading.set(false))
      );
  }

  updateUser(id: number, userData: UpdateUserDto): Observable<User> {
    this.loading.set(true);
    this.error.set(null);

    return this.userUseCase
      .updateUser(id, userData)
      .pipe(
        tap((updatedUser) => {
          // Actualizar el usuario en la lista local
          const currentUsers = this.usuarios();
          const index = currentUsers.findIndex(u => u.id === id);
          if (index !== -1) {
            const newUsers = [...currentUsers];
            newUsers[index] = updatedUser;
            this.usuarios.set(newUsers);
          }
        }),
        catchError((err) => {
          this.error.set('Error al actualizar usuario: ' + err.message);
          throw err; // Re-throw to allow component to handle it
        }),
        finalize(() => this.loading.set(false))
      );
  }

  searchUsers(term: string) {
    this.loading.set(true);
    this.error.set(null);

    this.userUseCase
      .searchUsers(term)
      .pipe(
        catchError((err) => {
          this.error.set('Error en búsqueda: ' + err.message);
          return of([]);
        }),
        finalize(() => this.loading.set(false))
      )
      .subscribe((usuarios) => {
        this.usuarios.set(usuarios);
      });
  }

  updateUserEstado(id: number, estado: boolean) {
    this.loading.set(true);
    this.error.set(null);

    return this.userUseCase.updateUserEstado(id, estado).pipe(
      catchError((err) => {
        this.error.set('Error al actualizar estado del usuario: ' + err.message);
        throw err;
      }),
      finalize(() => this.loading.set(false))
    );
  }
}