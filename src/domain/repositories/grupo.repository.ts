import { Observable } from 'rxjs';
import { Grupo, CreateGrupoDto, UpdateGrupoDto } from '../entities/grupo.entity';

export abstract class GrupoRepository {
  abstract getAllGrupos(): Observable<Grupo[]>;
  abstract getGrupoById(id: number): Observable<Grupo>;
  abstract createGrupo(grupo: CreateGrupoDto): Observable<Grupo>;
  abstract updateGrupo(grupo: UpdateGrupoDto): Observable<Grupo>;
  abstract deleteGrupo(id: number): Observable<void>;
  abstract getGruposByParams(nivelId: number, gradoId: number, modalidadId: number): Observable<Grupo[]>;
}
