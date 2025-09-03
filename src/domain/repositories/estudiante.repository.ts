import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { Estudiante, CreateEstudianteDto, UpdateEstudianteDto } from '../entities/estudiante.entity';

export interface EstudianteRepository {
  getAll(): Observable<Estudiante[]>;
  getById(id: number): Observable<Estudiante>;
  getByCurp(curp: string): Observable<Estudiante>;
  create(estudiante: CreateEstudianteDto): Observable<any>;
  update(estudiante: UpdateEstudianteDto): Observable<Estudiante>;
  delete(id: number): Observable<void>;
  search(term: string): Observable<Estudiante[]>;
  filterByParams(params: { [key: string]: any }): Observable<Estudiante[]>;
  updateEstado(id: number, estado: boolean): Observable<any>;
}

export const ESTUDIANTE_REPOSITORY = new InjectionToken<EstudianteRepository>('EstudianteRepository');