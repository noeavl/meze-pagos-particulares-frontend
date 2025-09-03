import { Injectable, signal } from '@angular/core';
import { catchError, finalize } from 'rxjs/operators';
import { of, Observable } from 'rxjs';
import { EstudianteUseCase } from '../../domain/use-cases/estudiante.use-case';
import {
  Estudiante,
  CreateEstudianteDto,
  UpdateEstudianteDto,
} from '../../domain/entities/estudiante.entity';

@Injectable({
  providedIn: 'root',
})
export class useEstudiante {
  estudiantes = signal<Estudiante[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  constructor(private estudianteUseCase: EstudianteUseCase) {}

  loadEstudiantes() {
    this.loading.set(true);
    this.error.set(null);

    this.estudianteUseCase
      .getAllEstudiantes()
      .pipe(
        catchError((err) => {
          this.error.set('Error al cargar estudiantes: ' + err.message);
          return of([]);
        }),
        finalize(() => this.loading.set(false))
      )
      .subscribe((estudiantes) => {
        this.estudiantes.set(estudiantes);
      });
  }

  getEstudianteById(id: number) {
    return this.estudianteUseCase.getEstudianteById(id).pipe(
      catchError((err) => {
        console.error('Error en hook getEstudianteById:', err);
        throw err;
      })
    );
  }

  createEstudiante(estudiante: CreateEstudianteDto) {
    this.loading.set(true);
    this.error.set(null);

    return this.estudianteUseCase.createEstudiante(estudiante).pipe(
      catchError((err) => {
        this.error.set('Error al crear estudiante: ' + err.message);
        throw err;
      }),
      finalize(() => this.loading.set(false))
    );
  }

  updateEstudiante(estudiante: UpdateEstudianteDto) {
    this.loading.set(true);
    this.error.set(null);

    return this.estudianteUseCase.updateEstudiante(estudiante).pipe(
      catchError((err) => {
        this.error.set('Error al actualizar estudiante: ' + err.message);
        throw err;
      }),
      finalize(() => this.loading.set(false))
    );
  }

  searchEstudiantes(term: string) {
    this.loading.set(true);
    this.error.set(null);

    this.estudianteUseCase
      .searchEstudiantes(term)
      .pipe(
        catchError((err) => {
          this.error.set('Error en búsqueda: ' + err.message);
          return of([]);
        }),
        finalize(() => this.loading.set(false))
      )
      .subscribe((estudiantes) => {
        this.estudiantes.set(estudiantes);
      });
  }

  filterEstudiantesByParams(params: { [key: string]: any }) {
    this.loading.set(true);
    this.error.set(null);

    this.estudianteUseCase
      .filterEstudiantesByParams(params)
      .pipe(
        catchError((err) => {
          this.error.set('Error al filtrar estudiantes: ' + err.message);
          return of([]);
        }),
        finalize(() => this.loading.set(false))
      )
      .subscribe((estudiantes) => {
        this.estudiantes.set(estudiantes);
      });
  }

  getEstudianteByCurp(curp: string): Observable<Estudiante> {
    this.loading.set(true);
    this.error.set(null);

    return this.estudianteUseCase.getEstudianteByCurp(curp).pipe(
      catchError((err) => {
        // Pasar el error completo para que el componente pueda acceder al mensaje
        this.error.set(err.error?.message || 'Estudiante no encontrado');
        throw err;
      }),
      finalize(() => this.loading.set(false))
    );
  }

  updateEstudianteEstado(id: number, estado: boolean) {
    this.loading.set(true);
    this.error.set(null);

    return this.estudianteUseCase.updateEstudianteEstado(id, estado).pipe(
      catchError((err) => {
        this.error.set('Error al actualizar estado del estudiante: ' + err.message);
        throw err;
      }),
      finalize(() => this.loading.set(false))
    );
  }
}
