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
  validationErrors = signal<{[key: string]: string[]} | null>(null);

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

  createPago(pago: CreatePagoAdeudoDto): Observable<any> {
    this.loading.set(true);
    this.error.set(null);
    this.validationErrors.set(null);

    return this.pagoUseCase.createPago(pago).pipe(
      tap((response) => {
        // The response is just a success message, no need to update pagos array
        console.log('Pago created successfully:', response.message);
      }),
      catchError((err) => {
        let errorMessage = 'Error al crear el pago';

        if (err.status === 409) {
          errorMessage =
            err.error?.message || 'El adeudo ya se encuentra pagado.';
        } else if (err.status === 400) {
          // Bad Request
          errorMessage =
            'Datos del pago inválidos. Verifique la información ingresada.';
        } else if (err.status === 422) {
          // Validation error - check for specific field errors
          if (err.error?.errors) {
            this.validationErrors.set(err.error.errors);
            errorMessage = err.error.message || 'Errores de validación. Verifique los datos ingresados.';
          } else {
            errorMessage = 'Error de validación. Verifique los datos ingresados.';
          }
        } else if (err.status >= 500) {
          // Server error
          errorMessage =
            'Error interno del servidor. Intente nuevamente más tarde.';
        }

        this.error.set(errorMessage);
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
