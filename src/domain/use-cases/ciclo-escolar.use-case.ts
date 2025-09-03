import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CicloEscolarRepository } from '../repositories/ciclo-escolar.repository';
import { CicloEscolar, CreateCicloEscolarDto, UpdateCicloEscolarDto } from '../entities/ciclo-escolar.entity';

@Injectable({
  providedIn: 'root',
})
export class CicloEscolarUseCase {
  constructor(private cicloEscolarRepository: CicloEscolarRepository) {}

  getAllCiclosEscolares(): Observable<CicloEscolar[]> {
    return this.cicloEscolarRepository.getAllCiclosEscolares();
  }

  getCicloEscolarById(id: number): Observable<CicloEscolar> {
    return this.cicloEscolarRepository.getCicloEscolarById(id);
  }

  createCicloEscolar(cicloEscolar: CreateCicloEscolarDto): Observable<CicloEscolar> {
    return this.cicloEscolarRepository.createCicloEscolar(cicloEscolar);
  }

  updateCicloEscolar(cicloEscolar: UpdateCicloEscolarDto): Observable<CicloEscolar> {
    return this.cicloEscolarRepository.updateCicloEscolar(cicloEscolar);
  }
}