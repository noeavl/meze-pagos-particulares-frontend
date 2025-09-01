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

// Interfaces para la nueva API de pagos-adeudos
export interface ApiPagoAdeudoResponse {
  id: number;
  pago_id: number;
  adeudo_id: number;
  created_at: string;
  updated_at: string;
  pago: {
    id: number;
    estudiante_id: number;
    folio: string;
    monto: string;
    metodo_pago: string;
    fecha: string;
    created_at: string;
    updated_at: string;
    estudiante: {
      id: number;
      persona_id: number;
      nombres: string;
      apellido_paterno: string;
      apellido_materno: string;
      persona: {
        id: number;
        nombres: string;
        apellido_paterno: string;
        apellido_materno: string;
      };
    };
  };
  adeudo: {
    id: number;
    concepto_id: number;
    estudiante_id: number;
    estado: string;
    pendiente: string;
    pagado: string;
    total: string;
    fecha_inicio: string;
    fecha_vencimiento: string;
    created_at: string;
    updated_at: string;
    concepto: {
      id: number;
      nombre: string;
    };
  };
}

export interface PagoAdeudo {
  id: number;
  pagoId: number;
  adeudoId: number;
  folio: string;
  monto: number;
  metodoPago: string;
  fecha: Date;
  estadoAdeudo: string;
  montoTotal: number;
  montoPagado: number;
  montoPendiente: number;
  fechaVencimiento: Date;
  createdAt: Date;
  nombreCompleto: string;
  concepto: string;
}

export interface CreatePagoAdeudoDto {
  adeudo_id: number;
  estudiante_id: number;
  folio: string;
  metodo_pago: string;
  monto: number;
  fecha: string;
}

export interface UpdatePagoAdeudoDto extends Partial<CreatePagoAdeudoDto> {
  id: number;
}

export type MetodoPago = 'efectivo' | 'transferencia';

export const METODOS_PAGO: { label: string; value: MetodoPago }[] = [
  { label: 'Efectivo', value: 'efectivo' },
  { label: 'Transferencia', value: 'transferencia' },
];
