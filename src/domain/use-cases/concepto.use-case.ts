import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ConceptoRepository } from '../repositories/concepto.repository';
import { Concepto, CreateConceptoDto, UpdateConceptoDto } from '../entities/concepto.entity';

@Injectable({
  providedIn: 'root',
})
export class ConceptoUseCase {
  constructor(private conceptoRepository: ConceptoRepository) {}

  getAllConceptos(): Observable<Concepto[]> {
    return this.conceptoRepository.getAllConceptos();
  }

  getConceptoById(id: number): Observable<Concepto> {
    return this.conceptoRepository.getConceptoById(id);
  }

  createConcepto(concepto: CreateConceptoDto): Observable<Concepto> {
    return this.conceptoRepository.createConcepto(concepto);
  }

  updateConcepto(concepto: UpdateConceptoDto): Observable<Concepto> {
    return this.conceptoRepository.updateConcepto(concepto);
  }

  deleteConcepto(id: number): Observable<void> {
    return this.conceptoRepository.deleteConcepto(id);
  }

  searchConceptos(term: string): Observable<Concepto[]> {
    return this.conceptoRepository.searchConceptos(term);
  }
}