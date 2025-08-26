import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AdeudoRepository } from '../repositories/adeudo.repository';
import { Adeudo, CreateAdeudoDto, UpdateAdeudoDto } from '../entities/adeudo.entity';

@Injectable({
  providedIn: 'root',
})
export class AdeudoUseCase {
  constructor(private adeudoRepository: AdeudoRepository) {}

  getAllAdeudos(): Observable<Adeudo[]> {
    return this.adeudoRepository.getAllAdeudos();
  }

  getAdeudoById(id: number): Observable<Adeudo> {
    return this.adeudoRepository.getAdeudoById(id);
  }

  createAdeudo(adeudo: CreateAdeudoDto): Observable<Adeudo> {
    return this.adeudoRepository.createAdeudo(adeudo);
  }

  updateAdeudo(adeudo: UpdateAdeudoDto): Observable<Adeudo> {
    return this.adeudoRepository.updateAdeudo(adeudo);
  }

  searchAdeudos(term: string): Observable<Adeudo[]> {
    return this.adeudoRepository.searchAdeudos(term);
  }
}