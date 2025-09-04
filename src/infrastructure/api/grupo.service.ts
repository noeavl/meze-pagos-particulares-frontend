import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GrupoRepository } from '../../domain/repositories/grupo.repository';
import { Grupo, CreateGrupoDto, UpdateGrupoDto } from '../../domain/entities/grupo.entity';
import { API_BASE_URL } from '../../shared/constants/api.constants';

@Injectable({ providedIn: 'root' })
export class GrupoService extends GrupoRepository {
    private http = inject(HttpClient);
    private apiUrl = `${API_BASE_URL}/grupos`;

    getAllGrupos(): Observable<Grupo[]> {
        return this.http.get<Grupo[]>(this.apiUrl);
    }

    getGrupoById(id: number): Observable<Grupo> {
        return this.http.get<Grupo>(`${this.apiUrl}/${id}`);
    }

    createGrupo(grupo: CreateGrupoDto): Observable<Grupo> {
        return this.http.post<Grupo>(this.apiUrl, grupo);
    }

    updateGrupo(grupo: UpdateGrupoDto): Observable<Grupo> {
        return this.http.put<Grupo>(`${this.apiUrl}/${grupo.id}`, grupo);
    }

    deleteGrupo(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
