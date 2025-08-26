import { Injectable, signal } from '@angular/core';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { ConceptoUseCase } from '../../domain/use-cases/concepto.use-case';
import {
  Concepto,
  CreateConceptoDto,
  UpdateConceptoDto,
} from '../../domain/entities/concepto.entity';

@Injectable({
  providedIn: 'root',
})
export class useConcepto {
  conceptos = signal<Concepto[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  constructor(private conceptoUseCase: ConceptoUseCase) {}

  loadConceptos() {
    this.loading.set(true);
    this.error.set(null);

    this.conceptoUseCase
      .getAllConceptos()
      .pipe(
        catchError((err) => {
          this.error.set('Error al cargar conceptos: ' + err.message);
          return of([]);
        }),
        finalize(() => this.loading.set(false))
      )
      .subscribe((conceptos) => {
        this.conceptos.set(conceptos);
      });
  }

  getConceptoById(id: number) {
    return this.conceptoUseCase.getConceptoById(id).pipe(
      catchError((err) => {
        console.error('Error en hook getConceptoById:', err);
        throw err;
      })
    );
  }

  createConcepto(concepto: CreateConceptoDto) {
    this.loading.set(true);
    this.error.set(null);

    return this.conceptoUseCase.createConcepto(concepto).pipe(
      catchError((err) => {
        this.error.set('Error al crear concepto: ' + err.message);
        throw err;
      }),
      finalize(() => this.loading.set(false))
    );
  }

  updateConcepto(concepto: UpdateConceptoDto) {
    this.loading.set(true);
    this.error.set(null);

    return this.conceptoUseCase.updateConcepto(concepto).pipe(
      catchError((err) => {
        this.error.set('Error al actualizar concepto: ' + err.message);
        throw err;
      }),
      finalize(() => this.loading.set(false))
    );
  }

  deleteConcepto(id: number) {
    this.loading.set(true);
    this.error.set(null);

    return this.conceptoUseCase.deleteConcepto(id).pipe(
      catchError((err) => {
        this.error.set('Error al eliminar concepto: ' + err.message);
        throw err;
      }),
      finalize(() => this.loading.set(false))
    );
  }

  searchConceptos(term: string) {
    this.loading.set(true);
    this.error.set(null);

    this.conceptoUseCase
      .searchConceptos(term)
      .pipe(
        catchError((err) => {
          this.error.set('Error en búsqueda: ' + err.message);
          return of([]);
        }),
        finalize(() => this.loading.set(false))
      )
      .subscribe((conceptos) => {
        this.conceptos.set(conceptos);
      });
  }
}