import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { PagoRepository } from "../../domain/repositories/pago.repository";
import {
  Pago,
  PagoAdeudo,
  CreatePagoAdeudoDto,
  UpdatePagoAdeudoDto,
  ApiPagoResponse,
  ApiPagoAdeudoResponse,
  ApiResponse,
  EstudianteConPagos,
  EstudiantePago,
} from "../../domain/entities/pago.entity";
import { Nivel } from "../../domain/value-objects/nivel.value-object";
import { Modalidad } from "../../domain/value-objects/modalidad.value-object";
import { API_ENDPOINTS } from "../../shared/constants/api.constants";

@Injectable()
export class PagoService extends PagoRepository {
  constructor(private http: HttpClient) {
    super();
  }

  getAllPagos(): Observable<Pago[]> {
    return this.http
      .get<ApiResponse<ApiPagoResponse[]>>(API_ENDPOINTS.pagos.getAll)
      .pipe(
        map((response) => response.data.map((item) => this.mapToDomain(item)))
      );
  }

  getPagoById(id: number): Observable<Pago> {
    return this.http
      .get<ApiResponse<ApiPagoResponse>>(API_ENDPOINTS.pagos.getById(id))
      .pipe(map((response) => this.mapToDomain(response.data)));
  }

  createPago(pago: CreatePagoAdeudoDto): Observable<any> {
    return this.http.post<{ success: boolean; message: string }>(
      API_ENDPOINTS.pagos.adeudos.create,
      pago
    );
  }

  updatePago(pago: UpdatePagoAdeudoDto): Observable<Pago> {
    return this.http
      .put<ApiResponse<ApiPagoResponse>>(
        API_ENDPOINTS.pagos.adeudos.update(pago.id),
        pago
      )
      .pipe(map((response) => this.mapToDomain(response.data)));
  }

  searchPagos(term: string): Observable<Pago[]> {
    return this.http
      .get<ApiResponse<ApiPagoResponse[]>>(
        `${API_ENDPOINTS.pagos.search}?q=${encodeURIComponent(term)}`
      )
      .pipe(
        map((response) => response.data.map((item) => this.mapToDomain(item)))
      );
  }

  getAllPagosAdeudos(): Observable<PagoAdeudo[]> {
    return this.http
      .get<ApiResponse<ApiPagoAdeudoResponse[]>>(API_ENDPOINTS.pagos.getAll)
      .pipe(
        map((response) =>
          response.data.map((item) => this.mapPagoAdeudoToDomain(item))
        )
      );
  }

  getEstudiantesConPagos(): Observable<EstudianteConPagos[]> {
    return this.http
      .get<ApiResponse<any[]>>(API_ENDPOINTS.estudiantes.pagos.getAll)
      .pipe(
        map((response) =>
          response.data.map((estudianteApi: any) =>
            this.mapEstudianteConPagos(estudianteApi)
          )
        )
      );
  }

  private mapToDomain(apiResponse: ApiPagoResponse): Pago {
    return {
      id: apiResponse.id,
      estudiante: {
        id: apiResponse.estudiante.id,
        nombres: apiResponse.estudiante.persona.nombres,
        apellidoPaterno: apiResponse.estudiante.persona.apellido_paterno,
        apellidoMaterno: apiResponse.estudiante.persona.apellido_materno,
        nivel: Nivel.createFromRaw(apiResponse.estudiante.nivel),
        grado: apiResponse.estudiante.grado,
        modalidad: Modalidad.createFromRaw(apiResponse.estudiante.modalidad),
        estado: apiResponse.estudiante.estado,
      },
      folio: apiResponse.folio,
      metodo: apiResponse.metodo as "efectivo" | "transferencia",
      monto: parseFloat(apiResponse.monto),
      fecha: new Date(apiResponse.fecha),
    };
  }

  private mapPagoAdeudoToDomain(
    apiResponse: ApiPagoAdeudoResponse
  ): PagoAdeudo {
    return {
      id: apiResponse.id,
      pagoId: apiResponse.pago.id,
      adeudoId: apiResponse.adeudo.id,
      folio: apiResponse.pago.folio,
      monto: parseFloat(apiResponse.pago.monto),
      metodoPago: apiResponse.pago.metodo_pago,
      fecha: new Date(apiResponse.pago.fecha),
      estadoAdeudo: apiResponse.adeudo.estado,
      montoTotal: parseFloat(apiResponse.adeudo.total),
      montoPagado: parseFloat(apiResponse.adeudo.pagado),
      montoPendiente: parseFloat(apiResponse.adeudo.pendiente),
      fechaVencimiento: new Date(apiResponse.adeudo.fecha_vencimiento),
      createdAt: new Date(apiResponse.created_at),
      nombreCompleto: `${apiResponse.pago.estudiante.persona.nombres} ${apiResponse.pago.estudiante.persona.apellido_paterno} ${apiResponse.pago.estudiante.persona.apellido_materno}`,
      concepto: apiResponse.adeudo.concepto.nombre,
      nivel: apiResponse.pago.estudiante.nivel,
      grado: apiResponse.pago.estudiante.grado,
      modalidad: apiResponse.pago.estudiante.modalidad,
    };
  }

  private mapEstudianteConPagos(estudianteApi: any): EstudianteConPagos {
    const pagos = estudianteApi.pagos.map((pagoApi: any) =>
      this.mapPago(pagoApi)
    );
    const montoTotalPagado = pagos.reduce(
      (total: number, pago: EstudiantePago) => total + pago.monto,
      0
    );
    const fechasOrdenadas = pagos
      .map((p: EstudiantePago) => p.fecha)
      .sort((a: Date, b: Date) => b.getTime() - a.getTime());
    const fechaUltimoPago =
      fechasOrdenadas.length > 0 ? fechasOrdenadas[0] : null;

    return {
      id: estudianteApi.id,
      nombreCompleto: `${estudianteApi.persona.nombres} ${estudianteApi.persona.apellido_paterno} ${estudianteApi.persona.apellido_materno}`,
      nivel: this.formatNivel(estudianteApi.nivel),
      grado: estudianteApi.grado,
      modalidad: this.formatModalidad(estudianteApi.modalidad),
      estado: estudianteApi.estado === 1,
      pagos,
      totalPagos: pagos.length,
      montoTotalPagado,
      fechaUltimoPago,
    };
  }

  private mapPago(pagoApi: any): EstudiantePago {
    // Mapear adeudos
    const adeudos = (pagoApi.adeudos || []).map((adeudo: any) => ({
      nombre: adeudo.concepto.nombre,
      tipo: "adeudo" as const,
    }));

    // Mapear requeridos
    const requeridos = (pagoApi.requeridos || []).map((requerido: any) => ({
      nombre: requerido.concepto.nombre,
      tipo: "requerido" as const,
    }));

    // Todos los conceptos juntos
    const conceptos = [
      ...adeudos.map((a: any) => a.nombre),
      ...requeridos.map((r: any) => r.nombre),
    ];

    // Total de conceptos (solo adeudos tienen total, requeridos usan el costo del concepto)
    const totalConceptosAdeudos = (pagoApi.adeudos || []).reduce(
      (total: number, adeudo: any) => total + parseFloat(adeudo.total),
      0
    );
    const totalConceptosRequeridos = (pagoApi.requeridos || []).reduce(
      (total: number, requerido: any) =>
        total + parseFloat(requerido.concepto.costo),
      0
    );
    const totalConceptos = totalConceptosAdeudos + totalConceptosRequeridos;

    return {
      id: pagoApi.id,
      folio: pagoApi.folio,
      monto: parseFloat(pagoApi.monto),
      metodoPago: pagoApi.metodo_pago,
      fecha: new Date(pagoApi.fecha),
      conceptos,
      totalConceptos,
      adeudos,
      requeridos,
    };
  }

  private formatNivel(nivel: string): string {
    const niveles: Record<string, string> = {
      preescolar: "Preescolar",
      primaria: "Primaria",
      secundaria: "Secundaria",
      bachillerato: "Bachillerato",
      bachillerato_sabatino: "Bachillerato Sabatino",
    };
    return niveles[nivel] || nivel;
  }

  private formatModalidad(modalidad: string): string {
    const modalidades: Record<string, string> = {
      presencial: "Presencial",
      en_linea: "En Línea",
    };
    return modalidades[modalidad] || modalidad;
  }
}
