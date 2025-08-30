import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { AdeudoUseCase } from '../../domain/use-cases/adeudo.use-case';
import {
  Adeudo,
  ApiGenerarAdeudosResponse,
  CreateAdeudoDto,
  GenerarAdeudosDto,
  UpdateAdeudoDto,
} from '../../domain/entities/adeudo.entity';
import { Pago } from '../../domain/entities/pago.entity';

@Injectable({
  providedIn: 'root',
})
export class useAdeudo {
  adeudos = signal<Adeudo[]>([]);
  adeudo = signal<Adeudo | null>(null);
  paymentHistory = signal<Pago[]>([]);
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

  getAdeudoById(id: number): Observable<Adeudo> {
    this.loading.set(true);
    this.error.set(null);

    return this.adeudoUseCase.getAdeudoById(id).pipe(
      tap((adeudo) => {
        this.adeudo.set(adeudo);
        this.paymentHistory.set(adeudo.pagos || []);
      }),
      catchError((err) => {
        this.error.set('Error al obtener el adeudo: ' + err.message);
        throw err; // Re-throw error for the component to handle
      }),
      finalize(() => this.loading.set(false))
    );
  }

  createAdeudo(adeudo: CreateAdeudoDto): Observable<Adeudo> {
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

  generateAdeudosMassive(
    year: GenerarAdeudosDto
  ): Observable<ApiGenerarAdeudosResponse> {
    this.loading.set(true);
    this.error.set(null);

    return this.adeudoUseCase.generateAdeudosMassive(year).pipe(
      catchError((error) => {
        if (error.status === 409) {
          this.error.set(error.error.message);
        } else {
          this.error.set(
            'Error al generar los adeudos: ' +
              (error.error?.message || error.message)
          );
        }
        throw error;
      }),
      finalize(() => this.loading.set(false))
    );
  }

  updateAdeudo(adeudo: UpdateAdeudoDto): Observable<Adeudo> {
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

  historyPayments(id: number): Observable<Pago[]> {
    this.loading.set(true);
    this.error.set(null);

    return this.adeudoUseCase.historyPayments(id).pipe(
      tap((payments) => {
        this.paymentHistory.set(payments);
      }),
      catchError((err) => {
        this.error.set('Error al obtener historial de pagos: ' + err.message);
        throw err;
      }),
      finalize(() => this.loading.set(false))
    );
  }
}
