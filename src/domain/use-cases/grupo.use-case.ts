import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { GrupoRepository } from '../repositories/grupo.repository';
import { Grupo, CreateGrupoDto, UpdateGrupoDto } from '../entities/grupo.entity';

@Injectable({ providedIn: 'root' })
export class GrupoUseCase {
  private repository = inject(GrupoRepository);

  getAllGrupos(): Observable<Grupo[]> {
    return this.repository.getAllGrupos();
  }

  getGrupoById(id: number): Observable<Grupo> {
    return this.repository.getGrupoById(id);
  }

  createGrupo(grupo: CreateGrupoDto): Observable<Grupo> {
    return this.repository.createGrupo(grupo);
  }

  updateGrupo(grupo: UpdateGrupoDto): Observable<Grupo> {
    return this.repository.updateGrupo(grupo);
  }

  deleteGrupo(id: number): Observable<void> {
    return this.repository.deleteGrupo(id);
  }

  getGruposByParams(nivelId: number, gradoId: number, modalidadId: number): Observable<Grupo[]> {
    return this.repository.getGruposByParams(nivelId, gradoId, modalidadId);
  }
}
