import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PagoRepository } from '../repositories/pago.repository';
import {
  Pago,
  PagoAdeudo,
  CreatePagoAdeudoDto,
  UpdatePagoAdeudoDto,
  CreatePagoRequeridoDto,
  EstudianteConPagos,
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

  createPago(pago: CreatePagoAdeudoDto): Observable<any> {
    return this.pagoRepository.createPago(pago);
  }

  createPagoRequerido(pago: CreatePagoRequeridoDto): Observable<any> {
    return this.pagoRepository.createPagoRequerido(pago);
  }

  updatePago(pago: UpdatePagoAdeudoDto): Observable<Pago> {
    return this.pagoRepository.updatePago(pago);
  }

  searchPagos(term: string): Observable<Pago[]> {
    return this.pagoRepository.searchPagos(term);
  }

  getAllPagosAdeudos(): Observable<PagoAdeudo[]> {
    return this.pagoRepository.getAllPagosAdeudos();
  }

  getEstudiantesConPagos(): Observable<EstudianteConPagos[]> {
    return this.pagoRepository.getEstudiantesConPagos();
  }
}
