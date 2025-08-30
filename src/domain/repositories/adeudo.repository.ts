import { Observable } from 'rxjs';
import {
  Adeudo,
  ApiGenerarAdeudosResponse,
  CreateAdeudoDto,
  GenerarAdeudosDto,
  UpdateAdeudoDto,
} from '../entities/adeudo.entity';
import { Pago } from '../entities/pago.entity';

export abstract class AdeudoRepository {
  abstract getAllAdeudos(): Observable<Adeudo[]>;
  abstract getAdeudoById(id: number): Observable<Adeudo>;
  abstract createAdeudo(adeudo: CreateAdeudoDto): Observable<Adeudo>;
  abstract generateAdeudos(
    ciclo: GenerarAdeudosDto
  ): Observable<ApiGenerarAdeudosResponse>;
  abstract updateAdeudo(adeudo: UpdateAdeudoDto): Observable<Adeudo>;
  abstract searchAdeudos(term: string): Observable<Adeudo[]>;
  abstract historyPayments(id: number): Observable<Pago[]>;
}
