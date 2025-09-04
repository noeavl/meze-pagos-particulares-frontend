import { inject, signal } from '@angular/core';
import { GrupoUseCase } from '../../domain/use-cases/grupo.use-case';
import { Grupo, CreateGrupoDto, UpdateGrupoDto } from '../../domain/entities/grupo.entity';
import { Observable } from 'rxjs';

export const useGrupo = () => {
  const grupoUseCase = inject(GrupoUseCase);

  const grupos = signal<Grupo[]>([]);
  const loading = signal<boolean>(false);
  const error = signal<string | null>(null);

  const loadGrupos = () => {
    loading.set(true);
    error.set(null);
    grupoUseCase.getAllGrupos().subscribe({
      next: (data: any) => {
        grupos.set(data.data);
        loading.set(false);
      },
      error: (err) => {
        error.set('Error al cargar los grupos');
        loading.set(false);
      },
    });
  };

  const getGrupoById = (id: number): Observable<Grupo> => {
    return grupoUseCase.getGrupoById(id);
  }

  const createGrupo = (grupo: CreateGrupoDto): Observable<Grupo> => {
    return grupoUseCase.createGrupo(grupo);
  }

  const updateGrupo = (grupo: UpdateGrupoDto): Observable<Grupo> => {
    return grupoUseCase.updateGrupo(grupo);
  }

  return {
    grupos,
    loading,
    error,
    loadGrupos,
    getGrupoById,
    createGrupo,
    updateGrupo,
  };
};
