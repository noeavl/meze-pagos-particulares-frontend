import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { EstudianteRepository, ESTUDIANTE_REPOSITORY } from '../repositories/estudiante.repository';
import { Estudiante, CreateEstudianteDto, UpdateEstudianteDto } from '../entities/estudiante.entity';

@Injectable({
  providedIn: 'root'
})
export class EstudianteUseCase {
  private estudianteRepository = inject(ESTUDIANTE_REPOSITORY);

  getAllEstudiantes(): Observable<Estudiante[]> {
    return this.estudianteRepository.getAll();
  }

  getEstudianteById(id: number): Observable<Estudiante> {
    return this.estudianteRepository.getById(id);
  }

  createEstudiante(estudiante: CreateEstudianteDto): Observable<Estudiante> {
    return this.estudianteRepository.create(estudiante);
  }

  updateEstudiante(estudiante: UpdateEstudianteDto): Observable<Estudiante> {
    return this.estudianteRepository.update(estudiante);
  }

  deleteEstudiante(id: number): Observable<void> {
    return this.estudianteRepository.delete(id);
  }

  searchEstudiantes(term: string): Observable<Estudiante[]> {
    return this.estudianteRepository.search(term);
  }

  filterEstudiantesByParams(params: { [key: string]: any }): Observable<Estudiante[]> {
    return this.estudianteRepository.filterByParams(params);
  }
}