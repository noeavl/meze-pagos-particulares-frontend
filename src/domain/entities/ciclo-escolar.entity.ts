export interface ApiCicloEscolarResponse {
  id: number;
  nombre: string;
  fecha_inicio: string;
  fecha_fin: string;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface CicloEscolar {
  id: number;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
}

export interface CreateCicloEscolarDto {
  fecha_inicio: string;
  fecha_fin: string;
}

export interface UpdateCicloEscolarDto {
  id: number;
  fecha_inicio: string;
  fecha_fin: string;
}