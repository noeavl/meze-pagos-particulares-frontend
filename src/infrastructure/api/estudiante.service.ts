import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EstudianteRepository } from '../../domain/repositories/estudiante.repository';
import {
  Estudiante,
  CreateEstudianteDto,
  UpdateEstudianteDto,
  UpdateEstudianteEstadoDto,
  ApiEstudianteResponse,
  ApiResponse,
} from '../../domain/entities/estudiante.entity';
import { Modalidad } from '../../domain/value-objects/modalidad.value-object';
import { Nivel } from '../../domain/value-objects/nivel.value-object';
import { API_ENDPOINTS } from '../../shared/constants/api.constants';

@Injectable({
  providedIn: 'root',
})
export class EstudianteService implements EstudianteRepository {
  private readonly endpoint = API_ENDPOINTS.ESTUDIANTES;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Estudiante[]> {
    return this.http
      .get<ApiResponse<ApiEstudianteResponse[]>>(this.endpoint)
      .pipe(
        map((response) => {
          console.log('API Response:', response);
          console.log('Students count from API:', response.data.length);
          const mappedStudents = response.data.map(this.mapApiResponseToEstudiante.bind(this));
          console.log('Mapped students:', mappedStudents);
          return mappedStudents;
        })
      );
  }

  getById(id: number): Observable<Estudiante> {
    return this.http
      .get<ApiResponse<ApiEstudianteResponse>>(`${this.endpoint}/${id}`)
      .pipe(map((response) => this.mapApiResponseToEstudiante(response.data)));
  }

  getByCurp(curp: string): Observable<Estudiante> {
    return this.http
      .get<ApiResponse<ApiEstudianteResponse>>(`${this.endpoint}/showByParam/${curp}`)
      .pipe(map((response) => this.mapApiResponseToEstudiante(response.data)));
  }


  create(estudiante: CreateEstudianteDto): Observable<any> {
    return this.http.post<any>(this.endpoint, estudiante);
  }

  update(estudiante: UpdateEstudianteDto): Observable<Estudiante> {
    const { id, ...updateData } = estudiante;
    return this.http
      .put<ApiResponse<ApiEstudianteResponse>>(
        `${this.endpoint}/${id}`,
        updateData
      )
      .pipe(map((response) => this.mapApiResponseToEstudiante(response.data)));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}/${id}`);
  }

  updateEstado(id: number, estado: boolean): Observable<any> {
    const updateData: UpdateEstudianteEstadoDto = { estado };
    return this.http.put<any>(`${this.endpoint}/actualizarEstado/${id}`, updateData);
  }

  search(term: string): Observable<Estudiante[]> {
    const params = new HttpParams().set('q', term);
    return this.http
      .get<ApiResponse<ApiEstudianteResponse[]>>(`${this.endpoint}/search`, {
        params,
      })
      .pipe(
        map((response) => response.data.map(this.mapApiResponseToEstudiante))
      );
  }

  filterByParams(filterParams: { [key: string]: any }): Observable<Estudiante[]> {
    let httpParams = new HttpParams();
    
    Object.keys(filterParams).forEach(key => {
      if (filterParams[key] !== null && filterParams[key] !== undefined && filterParams[key] !== '') {
        httpParams = httpParams.set(key, filterParams[key].toString());
      }
    });

    return this.http
      .get<ApiResponse<ApiEstudianteResponse[]>>(`${this.endpoint}/filter`, {
        params: httpParams,
      })
      .pipe(
        map((response) => response.data.map(this.mapApiResponseToEstudiante))
      );
  }

  private mapApiResponseToEstudiante(
    apiResponse: ApiEstudianteResponse
  ): Estudiante {
    console.log('Mapping student:', apiResponse.id, apiResponse.persona?.nombres);
    console.log('Nivel from API:', apiResponse.nivel_grado?.nivel?.nombre);
    console.log('Modalidad from API:', apiResponse.nivel_grado?.modalidad?.nombre);
    
    try {
      const estudiante = {
        id: apiResponse.id,
        nombres: apiResponse.persona.nombres,
        apellidoPaterno: apiResponse.persona.apellido_paterno,
        apellidoMaterno: apiResponse.persona.apellido_materno,
        curp: apiResponse.curp,
        nivel: Nivel.createFromRaw(apiResponse.nivel_grado.nivel.nombre),
        grado: apiResponse.nivel_grado.grado.numero,
        modalidad: Modalidad.createFromRaw(apiResponse.nivel_grado.modalidad.nombre),
        estado: apiResponse.estado === 1,
        grupo: apiResponse.grupos.length > 0 ? apiResponse.grupos[0] : null,
      };
      console.log('Successfully mapped student:', estudiante.nombres);
      return estudiante;
    } catch (error) {
      console.error('Error mapping student:', apiResponse.id, error);
      throw error;
    }
  }
}
