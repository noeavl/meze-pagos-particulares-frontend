import { Observable } from 'rxjs';
import { CicloEscolar, CreateCicloEscolarDto, UpdateCicloEscolarDto } from '../entities/ciclo-escolar.entity';

export abstract class CicloEscolarRepository {
  abstract getAllCiclosEscolares(): Observable<CicloEscolar[]>;
  abstract getCicloEscolarById(id: number): Observable<CicloEscolar>;
  abstract createCicloEscolar(cicloEscolar: CreateCicloEscolarDto): Observable<CicloEscolar>;
  abstract updateCicloEscolar(cicloEscolar: UpdateCicloEscolarDto): Observable<CicloEscolar>;
}