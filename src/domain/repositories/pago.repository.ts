import { Observable } from 'rxjs';
import { Pago, CreatePagoDto, UpdatePagoDto } from '../entities/pago.entity';

export abstract class PagoRepository {
  abstract getAllPagos(): Observable<Pago[]>;
  abstract getPagoById(id: number): Observable<Pago>;
  abstract createPago(pago: CreatePagoDto): Observable<Pago>;
  abstract updatePago(pago: UpdatePagoDto): Observable<Pago>;
  abstract searchPagos(term: string): Observable<Pago[]>;
}