import { Observable } from 'rxjs';
import {
  Pago,
  PagoAdeudo,
  CreatePagoAdeudoDto,
  UpdatePagoAdeudoDto,
  CreatePagoRequeridoDto,
  EstudianteConPagos,
} from '../entities/pago.entity';

export abstract class PagoRepository {
  abstract getAllPagos(): Observable<Pago[]>;
  abstract getPagoById(id: number): Observable<Pago>;
  abstract createPago(pago: CreatePagoAdeudoDto): Observable<any>;
  abstract createPagoRequerido(pago: CreatePagoRequeridoDto): Observable<any>;
  abstract updatePago(pago: UpdatePagoAdeudoDto): Observable<Pago>;
  abstract searchPagos(term: string): Observable<Pago[]>;
  abstract getAllPagosAdeudos(): Observable<PagoAdeudo[]>;
  abstract getEstudiantesConPagos(): Observable<EstudianteConPagos[]>;
}
