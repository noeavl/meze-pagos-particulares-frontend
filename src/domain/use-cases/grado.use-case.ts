import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GradoRepository } from '../repositories/grado.repository';
import { GradoEntity } from '../entities/grado.entity';

@Injectable({
  providedIn: 'root',
})
export class GradoUseCase {
  constructor(private gradoRepository: GradoRepository) {}

  getGradosByNivel(nivel: string): Observable<GradoEntity[]> {
    return this.gradoRepository.getByNivel(nivel);
  }
}