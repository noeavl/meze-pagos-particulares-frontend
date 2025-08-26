import { Observable } from 'rxjs';
import { Adeudo, CreateAdeudoDto, UpdateAdeudoDto } from '../entities/adeudo.entity';

export abstract class AdeudoRepository {
  abstract getAllAdeudos(): Observable<Adeudo[]>;
  abstract getAdeudoById(id: number): Observable<Adeudo>;
  abstract createAdeudo(adeudo: CreateAdeudoDto): Observable<Adeudo>;
  abstract updateAdeudo(adeudo: UpdateAdeudoDto): Observable<Adeudo>;
  abstract searchAdeudos(term: string): Observable<Adeudo[]>;
}