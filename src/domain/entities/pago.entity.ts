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
      nivel: string;
      grado: string;
      modalidad: string;
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
  nivel: string;
  grado: string;
  modalidad: string;
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

// Interfaces para la nueva API de estudiantes con pagos
export interface ApiPersonaResponse {
  id: number;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  created_at: string;
  updated_at: string;
}

export interface ApiConceptoResponse {
  id: number;
  nombre: string;
  costo: string;
  periodo: string;
  nivel: string;
  modalidad: string;
  created_at: string;
  updated_at: string;
}

export interface ApiAdeudoEnPagoResponse {
  id: number;
  concepto_id: number;
  estudiante_id: number;
  descripcion_periodo: string | null;
  estado: string;
  pendiente: string;
  pagado: string;
  total: string;
  fecha_inicio: string;
  fecha_vencimiento: string;
  created_at: string;
  updated_at: string;
  pivot: {
    pago_id: number;
    adeudo_id: number;
    created_at: string;
    updated_at: string;
  };
  concepto: ApiConceptoResponse;
}

export interface ApiRequeridoEnPagoResponse {
  id: number;
  concepto_id: number;
  created_at: string;
  updated_at: string;
  concepto: ApiConceptoResponse;
}

export interface ApiPagoConAdeudosResponse {
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
    nivel: string;
    grado: string;
    modalidad: string;
    estado: number;
    created_at: string;
    updated_at: string;
    persona: ApiPersonaResponse;
  };
  adeudos: ApiAdeudoEnPagoResponse[];
  requeridos: ApiRequeridoEnPagoResponse[];
}

export interface ApiEstudianteConPagosResponse {
  id: number;
  persona_id: number;
  nivel: string;
  grado: string;
  modalidad: string;
  estado: number;
  created_at: string;
  updated_at: string;
  persona: ApiPersonaResponse;
  pagos: ApiPagoConAdeudosResponse[];
}

export interface EstudiantePago {
  id: number;
  folio: string;
  monto: number;
  metodoPago: string;
  fecha: Date;
  conceptos: string[];
  totalConceptos: number;
  adeudos: {
    nombre: string;
    tipo: 'adeudo';
  }[];
  requeridos: {
    nombre: string;
    tipo: 'requerido';
  }[];
}

export interface EstudianteConPagos {
  id: number;
  nombreCompleto: string;
  nivel: string;
  grado: string;
  modalidad: string;
  estado: boolean;
  pagos: EstudiantePago[];
  totalPagos: number;
  montoTotalPagado: number;
  fechaUltimoPago: Date | null;
}
