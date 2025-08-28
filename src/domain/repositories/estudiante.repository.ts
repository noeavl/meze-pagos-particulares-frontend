import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { Estudiante, CreateEstudianteDto, UpdateEstudianteDto } from '../entities/estudiante.entity';

export interface EstudianteRepository {
  getAll(): Observable<Estudiante[]>;
  getById(id: number): Observable<Estudiante>;
  create(estudiante: CreateEstudianteDto): Observable<Estudiante>;
  update(estudiante: UpdateEstudianteDto): Observable<Estudiante>;
  delete(id: number): Observable<void>;
  search(term: string): Observable<Estudiante[]>;
  filterByParams(params: { [key: string]: any }): Observable<Estudiante[]>;
}

export const ESTUDIANTE_REPOSITORY = new InjectionToken<EstudianteRepository>('EstudianteRepository');