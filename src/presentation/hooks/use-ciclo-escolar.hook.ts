import { Injectable, signal } from '@angular/core';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { CicloEscolarUseCase } from '../../domain/use-cases/ciclo-escolar.use-case';
import {
  CicloEscolar,
  CreateCicloEscolarDto,
  UpdateCicloEscolarDto,
} from '../../domain/entities/ciclo-escolar.entity';

@Injectable({
  providedIn: 'root',
})
export class useCicloEscolar {
  ciclosEscolares = signal<CicloEscolar[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  constructor(private cicloEscolarUseCase: CicloEscolarUseCase) {}

  loadCiclosEscolares() {
    this.loading.set(true);
    this.error.set(null);

    this.cicloEscolarUseCase
      .getAllCiclosEscolares()
      .pipe(
        catchError((err) => {
          this.error.set('Error al cargar ciclos escolares: ' + err.message);
          return of([]);
        }),
        finalize(() => this.loading.set(false))
      )
      .subscribe((ciclosEscolares) => {
        this.ciclosEscolares.set(ciclosEscolares);
      });
  }

  getCicloEscolarById(id: number) {
    return this.cicloEscolarUseCase.getCicloEscolarById(id).pipe(
      catchError((err) => {
        console.error('Error en hook getCicloEscolarById:', err);
        throw err;
      })
    );
  }

  createCicloEscolar(cicloEscolar: CreateCicloEscolarDto) {
    this.loading.set(true);
    this.error.set(null);

    return this.cicloEscolarUseCase.createCicloEscolar(cicloEscolar).pipe(
      catchError((err) => {
        this.error.set('Error al crear ciclo escolar: ' + err.message);
        throw err;
      }),
      finalize(() => this.loading.set(false))
    );
  }

  updateCicloEscolar(cicloEscolar: UpdateCicloEscolarDto) {
    this.loading.set(true);
    this.error.set(null);

    return this.cicloEscolarUseCase.updateCicloEscolar(cicloEscolar).pipe(
      catchError((err) => {
        this.error.set('Error al actualizar ciclo escolar: ' + err.message);
        throw err;
      }),
      finalize(() => this.loading.set(false))
    );
  }
}