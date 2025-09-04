import { CicloEscolar } from './ciclo-escolar.entity';

export interface Grupo {
  id: number;
  nombre: string;
  ciclo_escolar_id: number;
  ciclo_escolar?: CicloEscolar;
}

export interface CreateGrupoDto {
  nombre: string;
  ciclo_escolar_id: number;
}

export interface UpdateGrupoDto {
  id: number;
  nombre: string;
}
