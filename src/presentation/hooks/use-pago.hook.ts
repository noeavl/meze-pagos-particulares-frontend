import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { PagoUseCase } from '../../domain/use-cases/pago.use-case';
import {
  Pago,
  CreatePagoAdeudoDto,
  UpdatePagoAdeudoDto,
} from '../../domain/entities/pago.entity';

@Injectable({
  providedIn: 'root',
})
export class usePago {
  pagos = signal<Pago[]>([]);
  selectedPago = signal<Pago | null>(null);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  constructor(private pagoUseCase: PagoUseCase) {}

  loadPagos(): void {
    this.loading.set(true);
    this.error.set(null);

    this.pagoUseCase
      .getAllPagos()
      .pipe(
        catchError((err) => {
          this.error.set('Error al cargar los pagos');
          console.error('Error loading pagos:', err);
          return of([]);
        }),
        finalize(() => this.loading.set(false))
      )
      .subscribe((pagos) => {
        this.pagos.set(pagos);
      });
  }

  getPagoById(id: number): Observable<Pago> {
    this.loading.set(true);
    this.error.set(null);

    return this.pagoUseCase.getPagoById(id).pipe(
      tap((pago) => {
        this.selectedPago.set(pago);
      }),
      catchError((err) => {
        this.error.set('Error al cargar el pago');
        console.error('Error loading pago:', err);
        throw err;
      }),
      finalize(() => this.loading.set(false))
    );
  }

  createPago(pago: CreatePagoAdeudoDto): Observable<Pago> {
    this.loading.set(true);
    this.error.set(null);

    return this.pagoUseCase.createPago(pago).pipe(
      tap((newPago) => {
        this.pagos.update((pagos) => [...pagos, newPago]);
      }),
      catchError((err) => {
        this.error.set('Error al crear el pago');
        console.error('Error creating pago:', err);
        throw err; // Re-throw the error to be handled by the component
      }),
      finalize(() => this.loading.set(false))
    );
  }

  updatePago(pago: UpdatePagoAdeudoDto): Observable<Pago> {
    this.loading.set(true);
    this.error.set(null);

    return this.pagoUseCase.updatePago(pago).pipe(
      tap((updatedPago) => {
        this.pagos.update((pagos) =>
          pagos.map((p) => (p.id === updatedPago.id ? updatedPago : p))
        );
        this.selectedPago.set(updatedPago);
      }),
      catchError((err) => {
        this.error.set('Error al actualizar el pago');
        console.error('Error updating pago:', err);
        throw err; // Re-throw the error to be handled by the component
      }),
      finalize(() => this.loading.set(false))
    );
  }

  searchPagos(term: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.pagoUseCase
      .searchPagos(term)
      .pipe(
        catchError((err) => {
          this.error.set('Error al buscar pagos');
          console.error('Error searching pagos:', err);
          return of([]);
        }),
        finalize(() => this.loading.set(false))
      )
      .subscribe((pagos) => {
        this.pagos.set(pagos);
      });
  }
}
