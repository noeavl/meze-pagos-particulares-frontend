import { Modalidad } from '../value-objects/modalidad.value-object';
import { Nivel } from '../value-objects/nivel.value-object';
import { Periodo } from '../value-objects/periodo.value-object';

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

export interface ApiConceptoResponse {
  id: number;
  nombre: string;
  tipo: string;
  periodo: string;
  nivel_id: number;
  modalidad_id: number;
  costo: string;
  created_at: string;
  updated_at: string;
  nivel: ApiNivelResponse;
  modalidad: ApiModalidadResponse;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface Concepto {
  id: number;
  nombre: string;
  tipo: 'adeudo' | 'requerido';
  periodo: Periodo;
  nivel: Nivel | null;
  modalidad: Modalidad | null;
  costo: number;
}

export interface CreateConceptoDto {
  nombre: string;
  tipo: string;
  periodo: string;
  nivel: string | null;
  modalidad: string | null;
  costo: number;
}

export interface UpdateConceptoDto extends Partial<CreateConceptoDto> {
  id: number;
}