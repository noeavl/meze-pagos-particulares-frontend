import { Observable } from 'rxjs';
import { NivelEntity } from '../entities/nivel.entity';

export abstract class NivelRepository {
  abstract getAll(): Observable<NivelEntity[]>;
  abstract getById(id: number): Observable<NivelEntity>;
}