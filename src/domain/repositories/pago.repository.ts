import { Observable } from 'rxjs';
import {
  Pago,
  CreatePagoAdeudoDto,
  UpdatePagoAdeudoDto,
} from '../entities/pago.entity';

export abstract class PagoRepository {
  abstract getAllPagos(): Observable<Pago[]>;
  abstract getPagoById(id: number): Observable<Pago>;
  abstract createPago(pago: CreatePagoAdeudoDto): Observable<any>;
  abstract updatePago(pago: UpdatePagoAdeudoDto): Observable<Pago>;
  abstract searchPagos(term: string): Observable<Pago[]>;
}
