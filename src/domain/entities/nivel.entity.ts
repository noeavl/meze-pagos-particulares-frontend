export interface ApiNivelEntityResponse {
  id: number;
  nombre: string;
  created_at: string;
  updated_at: string;
}

export interface ApiNivelResponse<T> {
  success: boolean;
  data: T;
}

export interface NivelEntity {
  id: number;
  nombre: string;
  displayName: string;
}