import { CicloEscolar } from './ciclo-escolar.entity';

export interface NivelGrado {
  id: number;
  nivel_id: number;
  grado_id: number;
  modalidad_id: number;
  created_at: string;
  updated_at: string;
  grado: {
    id: number;
    numero: string;
    created_at: string;
    updated_at: string;
  };
  nivel: {
    id: number;
    nombre: string;
    created_at: string;
    updated_at: string;
  };
  modalidad: {
    id: number;
    nombre: string;
    created_at: string;
    updated_at: string;
  };
}

export interface Grupo {
  id: number;
  nombre: string;
  ciclo_escolar_id: number;
  nivel_grado_id: number;
  created_at: string;
  updated_at: string;
  estudiantes: any[];
  ciclo_escolar?: CicloEscolar;
  nivel_grado?: NivelGrado;
}

export interface CreateGrupoDto {
  nombre: string;
  ciclo_escolar_id: number;
  nivel_id: number;
  grado_id: number;
  modalidad_id: number;
}

export interface UpdateGrupoDto {
  id: number;
  nombre: string;
}
