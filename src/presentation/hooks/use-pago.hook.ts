import { Injectable, signal, computed } from '@angular/core';
import { PagoUseCase } from '../../domain/use-cases/pago.use-case';
import { Pago, CreatePagoDto, UpdatePagoDto } from '../../domain/entities/pago.entity';

@Injectable()
export class usePago {
  private _pagos = signal<Pago[]>([]);
  private _selectedPago = signal<Pago | null>(null);
  private _loading = signal<boolean>(false);
  private _error = signal<string | null>(null);

  constructor(private pagoUseCase: PagoUseCase) {}

  // Computed properties
  pagos = computed(() => this._pagos());
  selectedPago = computed(() => this._selectedPago());
  loading = computed(() => this._loading());
  error = computed(() => this._error());

  // Actions
  loadPagos(): void {
    this._loading.set(true);
    this._error.set(null);

    this.pagoUseCase.getAllPagos().subscribe({
      next: (pagos) => {
        this._pagos.set(pagos);
        this._loading.set(false);
      },
      error: (error) => {
        this._error.set('Error al cargar los pagos');
        this._loading.set(false);
        console.error('Error loading pagos:', error);
      },
    });
  }

  loadPagoById(id: number): void {
    this._loading.set(true);
    this._error.set(null);

    this.pagoUseCase.getPagoById(id).subscribe({
      next: (pago) => {
        this._selectedPago.set(pago);
        this._loading.set(false);
      },
      error: (error) => {
        this._error.set('Error al cargar el pago');
        this._loading.set(false);
        console.error('Error loading pago:', error);
      },
    });
  }

  createPago(pago: CreatePagoDto): Promise<Pago> {
    this._loading.set(true);
    this._error.set(null);

    return new Promise((resolve, reject) => {
      this.pagoUseCase.createPago(pago).subscribe({
        next: (newPago) => {
          this._pagos.update((pagos) => [...pagos, newPago]);
          this._loading.set(false);
          resolve(newPago);
        },
        error: (error) => {
          this._error.set('Error al crear el pago');
          this._loading.set(false);
          console.error('Error creating pago:', error);
          reject(error);
        },
      });
    });
  }

  updatePago(pago: UpdatePagoDto): Promise<Pago> {
    this._loading.set(true);
    this._error.set(null);

    return new Promise((resolve, reject) => {
      this.pagoUseCase.updatePago(pago).subscribe({
        next: (updatedPago) => {
          this._pagos.update((pagos) =>
            pagos.map((p) => (p.id === updatedPago.id ? updatedPago : p))
          );
          this._selectedPago.set(updatedPago);
          this._loading.set(false);
          resolve(updatedPago);
        },
        error: (error) => {
          this._error.set('Error al actualizar el pago');
          this._loading.set(false);
          console.error('Error updating pago:', error);
          reject(error);
        },
      });
    });
  }

  searchPagos(term: string): void {
    this._loading.set(true);
    this._error.set(null);

    this.pagoUseCase.searchPagos(term).subscribe({
      next: (pagos) => {
        this._pagos.set(pagos);
        this._loading.set(false);
      },
      error: (error) => {
        this._error.set('Error al buscar pagos');
        this._loading.set(false);
        console.error('Error searching pagos:', error);
      },
    });
  }

  clearError(): void {
    this._error.set(null);
  }

  clearSelectedPago(): void {
    this._selectedPago.set(null);
  }
}