import { Injectable, signal } from '@angular/core';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { AdeudoUseCase } from '../../domain/use-cases/adeudo.use-case';
import {
  Adeudo,
  CreateAdeudoDto,
  UpdateAdeudoDto,
} from '../../domain/entities/adeudo.entity';

@Injectable({
  providedIn: 'root',
})
export class useAdeudo {
  adeudos = signal<Adeudo[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  constructor(private adeudoUseCase: AdeudoUseCase) {}

  loadAdeudos() {
    this.loading.set(true);
    this.error.set(null);

    this.adeudoUseCase
      .getAllAdeudos()
      .pipe(
        catchError((err) => {
          this.error.set('Error al cargar adeudos: ' + err.message);
          return of([]);
        }),
        finalize(() => this.loading.set(false))
      )
      .subscribe((adeudos) => {
        this.adeudos.set(adeudos);
      });
  }

  getAdeudoById(id: number) {
    return this.adeudoUseCase.getAdeudoById(id).pipe(
      catchError((err) => {
        console.error('Error en hook getAdeudoById:', err);
        throw err;
      })
    );
  }

  createAdeudo(adeudo: CreateAdeudoDto) {
    this.loading.set(true);
    this.error.set(null);

    return this.adeudoUseCase.createAdeudo(adeudo).pipe(
      catchError((err) => {
        this.error.set('Error al crear adeudo: ' + err.message);
        throw err;
      }),
      finalize(() => this.loading.set(false))
    );
  }

  updateAdeudo(adeudo: UpdateAdeudoDto) {
    this.loading.set(true);
    this.error.set(null);

    return this.adeudoUseCase.updateAdeudo(adeudo).pipe(
      catchError((err) => {
        this.error.set('Error al actualizar adeudo: ' + err.message);
        throw err;
      }),
      finalize(() => this.loading.set(false))
    );
  }

  searchAdeudos(term: string) {
    this.loading.set(true);
    this.error.set(null);

    this.adeudoUseCase
      .searchAdeudos(term)
      .pipe(
        catchError((err) => {
          this.error.set('Error en búsqueda: ' + err.message);
          return of([]);
        }),
        finalize(() => this.loading.set(false))
      )
      .subscribe((adeudos) => {
        this.adeudos.set(adeudos);
      });
  }
}