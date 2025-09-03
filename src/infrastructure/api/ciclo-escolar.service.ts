import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CicloEscolarRepository } from '../../domain/repositories/ciclo-escolar.repository';
import {
  CicloEscolar,
  CreateCicloEscolarDto,
  UpdateCicloEscolarDto,
  ApiCicloEscolarResponse,
  ApiResponse,
} from '../../domain/entities/ciclo-escolar.entity';
import { API_ENDPOINTS } from '../../shared/constants/api.constants';

@Injectable()
export class CicloEscolarService extends CicloEscolarRepository {
  constructor(private http: HttpClient) {
    super();
  }

  getAllCiclosEscolares(): Observable<CicloEscolar[]> {
    return this.http
      .get<ApiResponse<ApiCicloEscolarResponse[]>>(API_ENDPOINTS.ciclosEscolares.getAll)
      .pipe(
        map((response) => response.data.map((item) => this.mapToDomain(item)))
      );
  }

  getCicloEscolarById(id: number): Observable<CicloEscolar> {
    return this.http
      .get<ApiResponse<ApiCicloEscolarResponse>>(
        API_ENDPOINTS.ciclosEscolares.getById(id)
      )
      .pipe(map((response) => this.mapToDomain(response.data)));
  }

  createCicloEscolar(cicloEscolar: CreateCicloEscolarDto): Observable<CicloEscolar> {
    return this.http
      .post<ApiResponse<ApiCicloEscolarResponse>>(
        API_ENDPOINTS.ciclosEscolares.create,
        cicloEscolar
      )
      .pipe(map((response) => this.mapToDomain(response.data)));
  }

  updateCicloEscolar(cicloEscolar: UpdateCicloEscolarDto): Observable<CicloEscolar> {
    return this.http
      .put<ApiResponse<ApiCicloEscolarResponse>>(
        API_ENDPOINTS.ciclosEscolares.update(cicloEscolar.id),
        {
          fecha_inicio: cicloEscolar.fecha_inicio,
          fecha_fin: cicloEscolar.fecha_fin
        }
      )
      .pipe(map((response) => this.mapToDomain(response.data)));
  }

  private mapToDomain(apiResponse: ApiCicloEscolarResponse): CicloEscolar {
    return {
      id: apiResponse.id,
      nombre: apiResponse.nombre,
      fechaInicio: apiResponse.fecha_inicio.split('T')[0],
      fechaFin: apiResponse.fecha_fin.split('T')[0],
    };
  }
}