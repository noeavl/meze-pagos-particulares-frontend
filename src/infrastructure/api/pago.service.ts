import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PagoRepository } from '../../domain/repositories/pago.repository';
import {
  Pago,
  PagoAdeudo,
  CreatePagoAdeudoDto,
  UpdatePagoAdeudoDto,
  ApiPagoResponse,
  ApiPagoAdeudoResponse,
  ApiResponse,
} from '../../domain/entities/pago.entity';
import { Nivel } from '../../domain/value-objects/nivel.value-object';
import { Modalidad } from '../../domain/value-objects/modalidad.value-object';
import { API_ENDPOINTS } from '../../shared/constants/api.constants';

@Injectable()
export class PagoService extends PagoRepository {
  constructor(private http: HttpClient) {
    super();
  }

  getAllPagos(): Observable<Pago[]> {
    return this.http
      .get<ApiResponse<ApiPagoResponse[]>>(API_ENDPOINTS.pagos.adeudos.getAll)
      .pipe(
        map((response) => response.data.map((item) => this.mapToDomain(item)))
      );
  }

  getPagoById(id: number): Observable<Pago> {
    return this.http
      .get<ApiResponse<ApiPagoResponse>>(
        API_ENDPOINTS.pagos.adeudos.getById(id)
      )
      .pipe(map((response) => this.mapToDomain(response.data)));
  }

  createPago(pago: CreatePagoAdeudoDto): Observable<any> {
    return this.http
      .post<{success: boolean, message: string}>(
        API_ENDPOINTS.pagos.adeudos.create,
        pago
      );
  }

  updatePago(pago: UpdatePagoAdeudoDto): Observable<Pago> {
    return this.http
      .put<ApiResponse<ApiPagoResponse>>(
        API_ENDPOINTS.pagos.adeudos.update(pago.id),
        pago
      )
      .pipe(map((response) => this.mapToDomain(response.data)));
  }

  searchPagos(term: string): Observable<Pago[]> {
    return this.http
      .get<ApiResponse<ApiPagoResponse[]>>(
        `${API_ENDPOINTS.pagos.adeudos.search}?q=${encodeURIComponent(term)}`
      )
      .pipe(
        map((response) => response.data.map((item) => this.mapToDomain(item)))
      );
  }

  getAllPagosAdeudos(): Observable<PagoAdeudo[]> {
    return this.http
      .get<ApiResponse<ApiPagoAdeudoResponse[]>>(API_ENDPOINTS.pagos.adeudos.getAll)
      .pipe(
        map((response) => response.data.map((item) => this.mapPagoAdeudoToDomain(item)))
      );
  }

  private mapToDomain(apiResponse: ApiPagoResponse): Pago {
    return {
      id: apiResponse.id,
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
      folio: apiResponse.folio,
      metodo: apiResponse.metodo as 'efectivo' | 'transferencia',
      monto: parseFloat(apiResponse.monto),
      fecha: new Date(apiResponse.fecha),
    };
  }

  private mapPagoAdeudoToDomain(apiResponse: ApiPagoAdeudoResponse): PagoAdeudo {
    return {
      id: apiResponse.id,
      pagoId: apiResponse.pago.id,
      adeudoId: apiResponse.adeudo.id,
      folio: apiResponse.pago.folio,
      monto: parseFloat(apiResponse.pago.monto),
      metodoPago: apiResponse.pago.metodo_pago,
      fecha: new Date(apiResponse.pago.fecha),
      estadoAdeudo: apiResponse.adeudo.estado,
      montoTotal: parseFloat(apiResponse.adeudo.total),
      montoPagado: parseFloat(apiResponse.adeudo.pagado),
      montoPendiente: parseFloat(apiResponse.adeudo.pendiente),
      fechaVencimiento: new Date(apiResponse.adeudo.fecha_vencimiento),
      createdAt: new Date(apiResponse.created_at),
      nombreCompleto: `${apiResponse.pago.estudiante.persona.nombres} ${apiResponse.pago.estudiante.persona.apellido_paterno} ${apiResponse.pago.estudiante.persona.apellido_materno}`,
      concepto: apiResponse.adeudo.concepto.nombre,
      nivel: apiResponse.pago.estudiante.nivel,
      grado: apiResponse.pago.estudiante.grado,
      modalidad: apiResponse.pago.estudiante.modalidad,
    };
  }
}
