import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { NivelRepository } from '../repositories/nivel.repository';
import { NivelEntity } from '../entities/nivel.entity';

@Injectable({
  providedIn: 'root',
})
export class NivelUseCase {
  constructor(private nivelRepository: NivelRepository) {}

  getAllNiveles(): Observable<NivelEntity[]> {
    return this.nivelRepository.getAll();
  }

  getNivelById(id: number): Observable<NivelEntity> {
    return this.nivelRepository.getById(id);
  }
}