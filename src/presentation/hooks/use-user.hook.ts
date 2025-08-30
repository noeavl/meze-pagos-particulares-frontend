import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { UserUseCase } from '../../domain/use-cases/user.use-case';
import { User } from '../../domain/entities/user.entity';

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
}