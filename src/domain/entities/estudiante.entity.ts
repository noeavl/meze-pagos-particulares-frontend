import { Modalidad } from '../value-objects/modalidad.value-object';
import { Nivel } from '../value-objects/nivel.value-object';

// Interfaces para la respuesta de la API
export interface ApiEstudianteResponse {
  id: number;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  nivel: string;
  grado: string;
  modalidad: string;
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
}

export interface CreateEstudianteDto {
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  nivel: string;
  grado: string;
  modalidad: string;
}

export interface UpdateEstudianteDto extends Partial<CreateEstudianteDto> {
  id: number;
}
