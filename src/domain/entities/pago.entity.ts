import { Estudiante } from './estudiante.entity';

export interface ApiPagoResponse {
  id: number;
  estudiante_id: number;
  folio: string;
  metodo: string;
  monto: string;
  fecha: string;
  estudiante: any;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface Pago {
  id: number;
  estudiante: Estudiante;
  folio: string;
  metodo: 'efectivo' | 'transferencia';
  monto: number;
  fecha: Date;
}

export interface CreatePagoDto {
  estudiante_id: number;
  folio: string;
  metodo: string;
  monto: string;
  fecha: string;
}

export interface UpdatePagoDto extends Partial<CreatePagoDto> {
  id: number;
}

export type MetodoPago = 'efectivo' | 'transferencia';

export const METODOS_PAGO: { label: string; value: MetodoPago }[] = [
  { label: 'Efectivo', value: 'efectivo' },
  { label: 'Transferencia', value: 'transferencia' }
];