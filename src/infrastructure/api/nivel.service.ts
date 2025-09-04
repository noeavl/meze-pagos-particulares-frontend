import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { NivelRepository } from '../../domain/repositories/nivel.repository';
import {
  NivelEntity,
  ApiNivelEntityResponse,
  ApiNivelResponse,
} from '../../domain/entities/nivel.entity';
import { API_ENDPOINTS } from '../../shared/constants/api.constants';

@Injectable({
  providedIn: 'root',
})
export class NivelService implements NivelRepository {
  constructor(private http: HttpClient) {}

  getAll(): Observable<NivelEntity[]> {
    return this.http
      .get<ApiNivelResponse<ApiNivelEntityResponse[]>>(API_ENDPOINTS.niveles.getAll)
      .pipe(
        map((response) => response.data.map((item) => this.mapApiResponseToNivel(item)))
      );
  }

  getById(id: number): Observable<NivelEntity> {
    return this.http
      .get<ApiNivelResponse<ApiNivelEntityResponse>>(API_ENDPOINTS.niveles.getById(id))
      .pipe(map((response) => this.mapApiResponseToNivel(response.data)));
  }

  private mapApiResponseToNivel(apiResponse: ApiNivelEntityResponse): NivelEntity {
    return {
      id: apiResponse.id,
      nombre: apiResponse.nombre,
      displayName: this.getDisplayName(apiResponse.nombre),
    };
  }

  private getDisplayName(nombre: string): string {
    const displayNames: Record<string, string> = {
      preescolar: 'Preescolar',
      primaria: 'Primaria',
      secundaria: 'Secundaria',
      bachillerato: 'Bachillerato',
      bachillerato_sabatino: 'Bachillerato Sabatino',
      general: 'General',
    };
    return displayNames[nombre] || nombre;
  }
}