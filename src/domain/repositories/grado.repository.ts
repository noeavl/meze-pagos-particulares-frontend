import { Observable } from 'rxjs';
import { GradoEntity } from '../entities/grado.entity';

export abstract class GradoRepository {
  abstract getByNivel(nivel: string): Observable<GradoEntity[]>;
}