export interface ApiGradoEntityResponse {
  id: number;
  numero: string;
  created_at: string;
  updated_at: string;
}

export interface ApiGradoResponse<T> {
  success: boolean;
  data: T;
}

export interface GradoEntity {
  id: number;
  numero: string;
}