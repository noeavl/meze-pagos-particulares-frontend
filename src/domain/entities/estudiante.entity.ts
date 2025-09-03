import { Modalidad } from '../value-objects/modalidad.value-object';
import { Nivel } from '../value-objects/nivel.value-object';

export interface ApiPersonaResponse {
  id: number;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  created_at: string;
  updated_at: string;
}

export interface ApiEstudianteResponse {
  id: number;
  persona_id: number;
  nivel: string;
  grado: string;
  modalidad: string;
  estado: boolean;
  created_at: string;
  updated_at: string;
  persona: ApiPersonaResponse;
  grupo?: string;
  curp: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

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