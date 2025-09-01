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
  estudiantesConAdeudos = signal<any[]>([]);

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
      .subscribe((data: any) => {
        // Si la respuesta tiene la nueva estructura agrupada por estudiante
        if (Array.isArray(data) && data.length > 0 && data[0]?.persona && data[0]?.adeudos) {
          this.estudiantesConAdeudos.set(data);
          // Convertir a lista plana para compatibilidad con la interfaz anterior
          const adeudosFlat = data.flatMap((estudiante: any) => 
            estudiante.adeudos?.map((adeudo: any) => ({
              ...adeudo,
              id: adeudo.id,
              estudiante: {
                nombres: estudiante.persona?.nombres || '',
                apellidoPaterno: estudiante.persona?.apellido_paterno || '',
                apellidoMaterno: estudiante.persona?.apellido_materno || '',
                nivel: { rawValue: estudiante.nivel || '', displayValue: estudiante.nivel || '' },
                grado: estudiante.grado || 0,
                modalidad: { rawValue: estudiante.modalidad || '', displayValue: estudiante.modalidad || '' }
              },
              concepto: adeudo.concepto || {},
              montoTotal: parseFloat(adeudo.total || '0'),
              montoPagado: parseFloat(adeudo.pagado || '0'),
              montoPendiente: parseFloat(adeudo.pendiente || '0'),
              fechaVencimiento: adeudo.fecha_vencimiento,
              estado: {
                displayValue: adeudo.estado || 'pendiente',
                colorClass: adeudo.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                           adeudo.estado === 'pagado' ? 'bg-green-100 text-green-800' :
                           'bg-red-100 text-red-800'
              }
            })) || []
          );
          this.adeudos.set(adeudosFlat);
        } else {
          // Estructura anterior - los datos ya están procesados por el servicio
          this.adeudos.set(Array.isArray(data) ? data : []);
          this.estudiantesConAdeudos.set([]);
        }
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
