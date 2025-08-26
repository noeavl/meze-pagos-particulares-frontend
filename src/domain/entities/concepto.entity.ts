import { Modalidad } from '../value-objects/modalidad.value-object';
import { Nivel } from '../value-objects/nivel.value-object';
import { Periodo } from '../value-objects/periodo.value-object';

export interface ApiConceptoResponse {
  id: number;
  nombre: string;
  periodo: string;
  nivel: string | null;
  modalidad: string | null;
  costo: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface Concepto {
  id: number;
  nombre: string;
  periodo: Periodo;
  nivel: Nivel | null;
  modalidad: Modalidad | null;
  costo: number;
}

export interface CreateConceptoDto {
  nombre: string;
  periodo: string;
  nivel: string | null;
  modalidad: string | null;
  costo: number;
}

export interface UpdateConceptoDto extends Partial<CreateConceptoDto> {
  id: number;
}