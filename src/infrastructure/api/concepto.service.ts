import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConceptoRepository } from '../../domain/repositories/concepto.repository';
import {
  Concepto,
  CreateConceptoDto,
  UpdateConceptoDto,
  ApiConceptoResponse,
  ApiResponse,
} from '../../domain/entities/concepto.entity';
import { Periodo } from '../../domain/value-objects/periodo.value-object';
import { Nivel } from '../../domain/value-objects/nivel.value-object';
import { Modalidad } from '../../domain/value-objects/modalidad.value-object';
import { API_ENDPOINTS } from '../../shared/constants/api.constants';

@Injectable()
export class ConceptoService extends ConceptoRepository {
  constructor(private http: HttpClient) {
    super();
  }

  getAllConceptos(): Observable<Concepto[]> {
    return this.http
      .get<ApiResponse<ApiConceptoResponse[]>>(API_ENDPOINTS.conceptos.getAll)
      .pipe(
        map((response) => response.data.map((item) => this.mapToDomain(item)))
      );
  }

  getConceptoById(id: number): Observable<Concepto> {
    return this.http
      .get<ApiResponse<ApiConceptoResponse>>(
        API_ENDPOINTS.conceptos.getById(id)
      )
      .pipe(map((response) => this.mapToDomain(response.data)));
  }

  createConcepto(concepto: CreateConceptoDto): Observable<Concepto> {
    return this.http
      .post<ApiResponse<ApiConceptoResponse>>(
        API_ENDPOINTS.conceptos.create,
        concepto
      )
      .pipe(map((response) => this.mapToDomain(response.data)));
  }

  updateConcepto(concepto: UpdateConceptoDto): Observable<Concepto> {
    return this.http
      .put<ApiResponse<ApiConceptoResponse>>(
        API_ENDPOINTS.conceptos.update(concepto.id),
        concepto
      )
      .pipe(map((response) => this.mapToDomain(response.data)));
  }

  deleteConcepto(id: number): Observable<void> {
    return this.http.delete<void>(API_ENDPOINTS.conceptos.delete(id));
  }

  searchConceptos(term: string): Observable<Concepto[]> {
    return this.http
      .get<ApiResponse<ApiConceptoResponse[]>>(
        `${API_ENDPOINTS.conceptos.search}?q=${encodeURIComponent(term)}`
      )
      .pipe(
        map((response) => response.data.map((item) => this.mapToDomain(item)))
      );
  }

  private mapToDomain(apiResponse: ApiConceptoResponse): Concepto {
    return {
      id: apiResponse.id,
      nombre: apiResponse.nombre,
      tipo: apiResponse.tipo as 'adeudo' | 'requerido',
      periodo: Periodo.fromString(apiResponse.periodo),
      nivel: apiResponse.nivel ? Nivel.fromString(apiResponse.nivel.nombre) : null,
      modalidad: apiResponse.modalidad ? Modalidad.fromString(apiResponse.modalidad.nombre) : null,
      costo: parseFloat(apiResponse.costo),
    };
  }
}