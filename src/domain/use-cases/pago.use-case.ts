import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PagoRepository } from '../repositories/pago.repository';
import { Pago, CreatePagoDto, UpdatePagoDto } from '../entities/pago.entity';

@Injectable()
export class PagoUseCase {
  constructor(private pagoRepository: PagoRepository) {}

  getAllPagos(): Observable<Pago[]> {
    return this.pagoRepository.getAllPagos();
  }

  getPagoById(id: number): Observable<Pago> {
    return this.pagoRepository.getPagoById(id);
  }

  createPago(pago: CreatePagoDto): Observable<Pago> {
    return this.pagoRepository.createPago(pago);
  }

  updatePago(pago: UpdatePagoDto): Observable<Pago> {
    return this.pagoRepository.updatePago(pago);
  }

  searchPagos(term: string): Observable<Pago[]> {
    return this.pagoRepository.searchPagos(term);
  }
}