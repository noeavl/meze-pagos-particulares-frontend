import { Observable } from 'rxjs';
import { ModalidadEntity } from '../entities/modalidad-entity.entity';

export abstract class ModalidadEntityRepository {
  abstract getAll(): Observable<ModalidadEntity[]>;
  abstract getById(id: number): Observable<ModalidadEntity>;
}