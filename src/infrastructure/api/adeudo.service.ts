import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AdeudoRepository } from '../../domain/repositories/adeudo.repository';
import {
  Adeudo,
  CreateAdeudoDto,
  UpdateAdeudoDto,
  GenerarAdeudosDto,
  ApiAdeudoResponse,
  ApiPagoInAdeudoResponse,
  ApiGenerarAdeudosResponse,
  ApiResponse,
} from '../../domain/entities/adeudo.entity';
import { Pago } from '../../domain/entities/pago.entity';
import { Estado } from '../../domain/value-objects/estado.value-object';
import { Periodo } from '../../domain/value-objects/periodo.value-object';
import { Nivel } from '../../domain/value-objects/nivel.value-object';
import { Modalidad } from '../../domain/value-objects/modalidad.value-object';
import { API_ENDPOINTS } from '../../shared/constants/api.constants';

@Injectable()
export class AdeudoService extends AdeudoRepository {
  constructor(private http: HttpClient) {
    super();
  }

  getAllAdeudos(): Observable<Adeudo[]> {
    return this.http
      .get<ApiResponse<ApiAdeudoResponse[]>>(API_ENDPOINTS.adeudos.getAll)
      .pipe(
        map((response) => response.data.map((item) => this.mapToDomain(item)))
      );
  }

  getAdeudoById(id: number): Observable<Adeudo> {
    return this.http
      .get<ApiResponse<ApiAdeudoResponse>>(API_ENDPOINTS.adeudos.getById(id))
      .pipe(map((response) => this.mapToDomain(response.data)));
  }

  createAdeudo(adeudo: CreateAdeudoDto): Observable<Adeudo> {
    return this.http
      .post<ApiResponse<ApiAdeudoResponse>>(
        API_ENDPOINTS.adeudos.create,
        adeudo
      )
      .pipe(map((response) => this.mapToDomain(response.data)));
  }

  updateAdeudo(adeudo: UpdateAdeudoDto): Observable<Adeudo> {
    return this.http
      .put<ApiResponse<ApiAdeudoResponse>>(
        API_ENDPOINTS.adeudos.update(adeudo.id),
        adeudo
      )
      .pipe(map((response) => this.mapToDomain(response.data)));
  }

  searchAdeudos(term: string): Observable<Adeudo[]> {
    return this.http
      .get<ApiResponse<ApiAdeudoResponse[]>>(
        `${API_ENDPOINTS.adeudos.search}?q=${encodeURIComponent(term)}`
      )
      .pipe(
        map((response) => response.data.map((item) => this.mapToDomain(item)))
      );
  }

  generateAdeudos(
    ciclo: GenerarAdeudosDto
  ): Observable<ApiGenerarAdeudosResponse> {
    return this.http.post<ApiGenerarAdeudosResponse>(
      API_ENDPOINTS.adeudos.generate,
      ciclo
    );
  }

  historyPayments(id: number): Observable<Pago[]> {
    return this.http
      .get<ApiResponse<any[]>>(API_ENDPOINTS.adeudos.historyPayments(id))
      .pipe(
        map((response) => response.data.map((payment) => ({
          id: payment.id,
          folio: payment.folio,
          monto: parseFloat(payment.monto),
          metodo: payment.metodo_pago as 'efectivo' | 'transferencia',
          fecha: new Date(payment.fecha + 'T00:00:00'),
          estudiante: {
            id: payment.estudiante_id,
            nombres: '',
            apellidoPaterno: '',
            apellidoMaterno: '',
            nivel: {} as any,
            grado: '',
            modalidad: {} as any,
          }
        } as Pago)))
      );
  }

  private mapPagoToDomain(apiPago: ApiPagoInAdeudoResponse): Pago {
    return {
      id: apiPago.id,
      folio: apiPago.folio,
      monto: parseFloat(apiPago.monto),
      metodo: apiPago.metodo_pago as 'efectivo' | 'transferencia',
      fecha: new Date(apiPago.fecha + 'T00:00:00'),
      estudiante: {
        id: apiPago.estudiante_id,
        nombres: '',
        apellidoPaterno: '',
        apellidoMaterno: '',
        nivel: {} as any,
        grado: '',
        modalidad: {} as any,
        estado: true
      }
    };
  }

  private mapToDomain(apiResponse: ApiAdeudoResponse): Adeudo {
    return {
      id: apiResponse.id,
      concepto: {
        id: apiResponse.concepto.id,
        nombre: apiResponse.concepto.nombre,
        periodo: Periodo.fromString(apiResponse.concepto.periodo),
        nivel: apiResponse.concepto.nivel
          ? Nivel.fromString(apiResponse.concepto.nivel)
          : null,
        modalidad: apiResponse.concepto.modalidad
          ? Modalidad.fromString(apiResponse.concepto.modalidad)
          : null,
        costo: parseFloat(apiResponse.concepto.costo),
      },
      estudiante: {
        id: apiResponse.estudiante.id,
        nombres: apiResponse.estudiante.persona.nombres,
        apellidoPaterno: apiResponse.estudiante.persona.apellido_paterno,
        apellidoMaterno: apiResponse.estudiante.persona.apellido_materno,
        nivel: Nivel.createFromRaw(apiResponse.estudiante.nivel),
        grado: apiResponse.estudiante.grado,
        modalidad: Modalidad.createFromRaw(apiResponse.estudiante.modalidad),
        estado: apiResponse.estudiante.estado
      },
      estado: Estado.fromString(apiResponse.estado),
      montoPendiente: parseFloat(apiResponse.pendiente),
      montoTotal: parseFloat(apiResponse.total),
      montoPagado: parseFloat(apiResponse.pagado),
      fechaInicio: new Date(apiResponse.fecha_inicio.split('T')[0] + 'T00:00:00'),
      fechaVencimiento: new Date(apiResponse.fecha_vencimiento.split('T')[0] + 'T00:00:00'),
      pagos: apiResponse.pagos ? apiResponse.pagos.map(pago => this.mapPagoToDomain(pago)) : [],
    };
  }
}
