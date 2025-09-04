import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ModalidadEntityRepository } from '../repositories/modalidad-entity.repository';
import { ModalidadEntity } from '../entities/modalidad-entity.entity';

@Injectable({
  providedIn: 'root',
})
export class ModalidadEntityUseCase {
  constructor(private modalidadRepository: ModalidadEntityRepository) {}

  getAllModalidades(): Observable<ModalidadEntity[]> {
    return this.modalidadRepository.getAll();
  }

  getModalidadById(id: number): Observable<ModalidadEntity> {
    return this.modalidadRepository.getById(id);
  }
}