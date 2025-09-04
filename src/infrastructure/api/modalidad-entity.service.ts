import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ModalidadEntityRepository } from '../../domain/repositories/modalidad-entity.repository';
import {
  ModalidadEntity,
  ApiModalidadEntityResponse,
  ApiModalidadResponse,
} from '../../domain/entities/modalidad-entity.entity';
import { API_ENDPOINTS } from '../../shared/constants/api.constants';

@Injectable({
  providedIn: 'root',
})
export class ModalidadEntityService implements ModalidadEntityRepository {
  constructor(private http: HttpClient) {}

  getAll(): Observable<ModalidadEntity[]> {
    return this.http
      .get<ApiModalidadResponse<ApiModalidadEntityResponse[]>>(API_ENDPOINTS.modalidades.getAll)
      .pipe(
        map((response) => response.data.map((item) => this.mapApiResponseToModalidad(item)))
      );
  }

  getById(id: number): Observable<ModalidadEntity> {
    return this.http
      .get<ApiModalidadResponse<ApiModalidadEntityResponse>>(API_ENDPOINTS.modalidades.getById(id))
      .pipe(map((response) => this.mapApiResponseToModalidad(response.data)));
  }

  private mapApiResponseToModalidad(apiResponse: ApiModalidadEntityResponse): ModalidadEntity {
    return {
      id: apiResponse.id,
      nombre: apiResponse.nombre,
      displayName: this.getDisplayName(apiResponse.nombre),
    };
  }

  private getDisplayName(nombre: string): string {
    const displayNames: Record<string, string> = {
      presencial: 'Presencial',
      en_linea: 'En Línea',
      general: 'General',
    };
    return displayNames[nombre] || nombre;
  }
}