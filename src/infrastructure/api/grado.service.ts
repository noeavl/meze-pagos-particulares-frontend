import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { GradoRepository } from '../../domain/repositories/grado.repository';
import {
  GradoEntity,
  ApiGradoEntityResponse,
  ApiGradoResponse,
} from '../../domain/entities/grado.entity';
import { API_ENDPOINTS } from '../../shared/constants/api.constants';

@Injectable({
  providedIn: 'root',
})
export class GradoService implements GradoRepository {
  constructor(private http: HttpClient) {}

  getByNivel(nivel: string): Observable<GradoEntity[]> {
    return this.http
      .get<ApiGradoResponse<ApiGradoEntityResponse[]>>(API_ENDPOINTS.grados.getByNivel(nivel))
      .pipe(
        map((response) => response.data.map((item) => this.mapApiResponseToGrado(item)))
      );
  }

  private mapApiResponseToGrado(apiResponse: ApiGradoEntityResponse): GradoEntity {
    return {
      id: apiResponse.id,
      numero: apiResponse.numero,
    };
  }
}