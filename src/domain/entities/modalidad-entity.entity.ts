export interface ApiModalidadEntityResponse {
  id: number;
  nombre: string;
  created_at: string;
  updated_at: string;
}

export interface ApiModalidadResponse<T> {
  success: boolean;
  data: T;
}

export interface ModalidadEntity {
  id: number;
  nombre: string;
  displayName: string;
}