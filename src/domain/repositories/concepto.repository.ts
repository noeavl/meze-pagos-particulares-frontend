import { Observable } from 'rxjs';
import { Concepto, CreateConceptoDto, UpdateConceptoDto } from '../entities/concepto.entity';

export abstract class ConceptoRepository {
  abstract getAllConceptos(): Observable<Concepto[]>;
  abstract getConceptoById(id: number): Observable<Concepto>;
  abstract createConcepto(concepto: CreateConceptoDto): Observable<Concepto>;
  abstract updateConcepto(concepto: UpdateConceptoDto): Observable<Concepto>;
  abstract deleteConcepto(id: number): Observable<void>;
  abstract searchConceptos(term: string): Observable<Concepto[]>;
}