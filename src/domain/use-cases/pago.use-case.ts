import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PagoRepository } from '../repositories/pago.repository';
import {
  Pago,
  CreatePagoAdeudoDto,
  UpdatePagoAdeudoDto,
} from '../entities/pago.entity';

@Injectable()
export class PagoUseCase {
  constructor(private pagoRepository: PagoRepository) {}

  getAllPagos(): Observable<Pago[]> {
    return this.pagoRepository.getAllPagos();
  }

  getPagoById(id: number): Observable<Pago> {
    return this.pagoRepository.getPagoById(id);
  }

  createPago(pago: CreatePagoAdeudoDto): Observable<Pago> {
    return this.pagoRepository.createPago(pago);
  }

  updatePago(pago: UpdatePagoAdeudoDto): Observable<Pago> {
    return this.pagoRepository.updatePago(pago);
  }

  searchPagos(term: string): Observable<Pago[]> {
    return this.pagoRepository.searchPagos(term);
  }
}
