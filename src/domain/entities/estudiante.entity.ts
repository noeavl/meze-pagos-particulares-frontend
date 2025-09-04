
export interface ApiPersonaResponse {
  id: number;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  created_at: string;
  updated_at: string;
}

export interface ApiGradoResponse {
  id: number;
  numero: string;
  created_at: string;
  updated_at: string;
}

export interface ApiNivelResponse {
  id: number;
  nombre: string;
  created_at: string;
  updated_at: string;
}

export interface ApiModalidadResponse {
  id: number;
  nombre: string;
  created_at: string;
  updated_at: string;
}

export interface ApiNivelGradoResponse {
  id: number;
  nivel_id: number;
  grado_id: number;
  modalidad_id: number;
  created_at: string;
  updated_at: string;
  grado: ApiGradoResponse;
  nivel: ApiNivelResponse;
  modalidad: ApiModalidadResponse;
}

export interface ApiCicloEscolarResponse {
  id: number;
  nombre: string;
  fecha_inicio: string;
  fecha_fin: string;
  created_at: string;
  updated_at: string;
  estado: string;
}

export interface ApiEstudianteResponse {
  id: number;
  persona_id: number;
  curp: string;
  nivel_grado_id: number;
  ciclo_escolar_id: number;
  estado: number;
  created_at: string;
  updated_at: string;
  persona: ApiPersonaResponse;
  ciclo_escolar: ApiCicloEscolarResponse;
  grupos: any[];
  nivel_grado: ApiNivelGradoResponse;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

import { Modalidad } from '../value-objects/modalidad.value-object';
import { Nivel } from '../value-objects/nivel.value-object';

export interface Estudiante {
  id: number;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  nivel: Nivel;
  grado: string;
  modalidad: Modalidad;
  estado: boolean;
  grupo?: string;
  curp: string;
}

export interface CreateEstudianteDto {
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  nivel: string;
  grado: string;
  modalidad: string;
  grupo?: string;
  curp: string;
}

export interface UpdateEstudianteDto extends Partial<CreateEstudianteDto> {
  id: number;
}

export interface UpdateEstudianteEstadoDto {
  estado: boolean;
}