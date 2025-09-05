import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { GrupoRepository } from '../../domain/repositories/grupo.repository';
import { Grupo, CreateGrupoDto, UpdateGrupoDto } from '../../domain/entities/grupo.entity';
import { API_BASE_URL } from '../../shared/constants/api.constants';

@Injectable({ providedIn: 'root' })
export class GrupoService extends GrupoRepository {
    private http = inject(HttpClient);
    private apiUrl = `${API_BASE_URL}/grupos`;

    getAllGrupos(): Observable<Grupo[]> {
        return this.http.get<{success: boolean, data: Grupo[]}>(this.apiUrl)
            .pipe(
                map(response => {
                    if (response.success && response.data) {
                        return response.data;
                    }
                    return [];
                })
            );
    }

    getGrupoById(id: number): Observable<Grupo> {
        return this.http.get<{success: boolean, data: Grupo}>(`${this.apiUrl}/${id}`)
            .pipe(
                map(response => {
                    if (response.data) {
                        return response.data;
                    }
                    throw new Error('Grupo no encontrado');
                })
            );
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

    getGruposByParams(nivelId: number, gradoId: number, modalidadId: number, cicloEscolarId: number): Observable<Grupo[]> {
        return this.http.get<{success: boolean, data: Grupo[]}>(`${this.apiUrl}/showByParam/${nivelId}/${gradoId}/${modalidadId}/${cicloEscolarId}`)
            .pipe(
                map(response => {
                    if (response.success && response.data) {
                        return response.data;
                    }
                    return [];
                })
            );
    }
}
