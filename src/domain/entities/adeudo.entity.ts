import { Estado } from '../value-objects/estado.value-object';
import { Concepto } from './concepto.entity';
import { Estudiante } from './estudiante.entity';
import { Pago } from './pago.entity';

export interface ApiPagoInAdeudoResponse {
  id: number;
  estudiante_id: number;
  folio: string;
  monto: string;
  metodo_pago: string;
  fecha: string;
  created_at: string;
  updated_at: string;
  pivot: {
    adeudo_id: number;
    pago_id: number;
    created_at: string;
    updated_at: string;
  };
}

export interface ApiAdeudoResponse {
  id: number;
  concepto_id: number;
  estudiante_id: number;
  estado: string;
  pendiente: string;
  pagado: string;
  total: string;
  fecha_inicio: string;
  fecha_vencimiento: string;
  concepto: any;
  estudiante: any;
  created_at: string;
  updated_at: string;
  pagos?: ApiPagoInAdeudoResponse[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface Adeudo {
  id: number;
  concepto: Concepto;
  estudiante: Estudiante;
  estado: Estado;
  montoPendiente: number;
  montoTotal: number;
  montoPagado: number;
  fechaInicio: Date;
  fechaVencimiento: Date;
  descripcionPeriodo?: string;
  pagos?: Pago[];
}

export interface CreateAdeudoDto {
  concepto_id: number;
  estudiante_id: number;
  estado: string;
  pendiente: string;
  pagado: string;
  total: string;
  fecha_inicio: string;
  fecha_vencimiento: string;
}

export interface GenerarAdeudosDto {
  ciclo_escolar_id: number;
  modalidad_id: number;
  nivel_id: number;
}

export interface ApiGenerarAdeudosResponse {
  success: boolean;
  message: string;
}

export interface UpdateAdeudoDto extends Partial<CreateAdeudoDto> {
  id: number;
}
