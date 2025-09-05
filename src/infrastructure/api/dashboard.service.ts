import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, timeout, catchError } from 'rxjs';
import { tap, retry } from 'rxjs/operators';
import { API_ENDPOINTS } from '../../shared/constants/api.constants';

export interface DashboardKpis {
  ingresos_hoy: string;
  deuda_pendiente_total: string;
  deuda_vencida_total: number;
  estudiantes_con_vencidos: number;
}

export interface AdeudosPorEstado {
  estado: string;
  count: number;
}

export interface IngresosDiarios {
  fecha: string;
  total: string;
}

export interface DeudaPorConcepto {
  concepto: string;
  total_pendiente: string;
}

export interface UltimoPago {
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
    curp: string;
    nivel_grado_id: number;
    ciclo_escolar_id: number;
    estado: number;
    created_at: string;
    updated_at: string;
    grupo_actual: any;
    persona: {
      id: number;
      nombres: string;
      apellido_paterno: string;
      apellido_materno: string;
      created_at: string;
      updated_at: string;
    };
    ciclo_escolar: {
      id: number;
      nombre: string;
      fecha_inicio: string;
      fecha_fin: string;
      created_at: string;
      updated_at: string;
      estado: string;
    };
    nivel_grado: {
      id: number;
      nivel_id: number;
      grado_id: number;
      modalidad_id: number;
      created_at: string;
      updated_at: string;
      grado: {
        id: number;
        numero: string;
        created_at: string;
        updated_at: string;
      };
      nivel: {
        id: number;
        nombre: string;
        created_at: string;
        updated_at: string;
      };
      modalidad: {
        id: number;
        nombre: string;
        created_at: string;
        updated_at: string;
      };
    };
  };
  adeudos: any[];
}

export interface TopDeudor {
  estudiante_id: number;
  total_deuda: string;
  concepto: any;
  estudiante: {
    id: number;
    persona_id: number;
    curp: string;
    nivel_grado_id: number;
    ciclo_escolar_id: number;
    estado: number;
    created_at: string;
    updated_at: string;
    grupo_actual: any;
    persona: {
      id: number;
      nombres: string;
      apellido_paterno: string;
      apellido_materno: string;
      created_at: string;
      updated_at: string;
    };
    ciclo_escolar: {
      id: number;
      nombre: string;
      fecha_inicio: string;
      fecha_fin: string;
      created_at: string;
      updated_at: string;
      estado: string;
    };
    nivel_grado: {
      id: number;
      nivel_id: number;
      grado_id: number;
      modalidad_id: number;
      created_at: string;
      updated_at: string;
      grado: {
        id: number;
        numero: string;
        created_at: string;
        updated_at: string;
      };
      nivel: {
        id: number;
        nombre: string;
        created_at: string;
        updated_at: string;
      };
      modalidad: {
        id: number;
        nombre: string;
        created_at: string;
        updated_at: string;
      };
    };
  };
}

export interface DashboardResponse {
  kpis: DashboardKpis;
  graficos: {
    adeudos_por_estado: AdeudosPorEstado[];
    ingresos_ultimos_30_dias: IngresosDiarios[];
    deuda_por_concepto: DeudaPorConcepto[];
  };
  listas: {
    ultimos_pagos: UltimoPago[];
    top_deudores: TopDeudor[];
  };
  contexto: {
    ciclo_escolar_id: number;
    ciclo_escolar_nombre: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private cache: DashboardResponse | null = null;
  private cacheTime: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

  constructor(private http: HttpClient) {}

  getDashboardData(): Observable<DashboardResponse> {
    const now = Date.now();
    console.log('DashboardService.getDashboardData called', { 
      hasCache: !!this.cache, 
      cacheAge: now - this.cacheTime,
      cacheDuration: this.CACHE_DURATION 
    });
    
    // Si tenemos cache válido, devolverlo
    if (this.cache && (now - this.cacheTime) < this.CACHE_DURATION) {
      console.log('Returning cached data');
      return new Observable(observer => {
        observer.next(this.cache!);
        observer.complete();
      });
    }

    // Si no hay cache o expiró, hacer llamada HTTP
    console.log('Making HTTP call to:', API_ENDPOINTS.DASHBOARD);
    const headers = new HttpHeaders({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    return this.http.get<DashboardResponse>(API_ENDPOINTS.DASHBOARD, { headers }).pipe(
      timeout(10000), // Timeout de 10 segundos
      retry(2), // Reintentar 2 veces en caso de error
      tap(data => {
        console.log('HTTP response received, caching data');
        this.cache = data;
        this.cacheTime = now;
      }),
      catchError(error => {
        console.error('Dashboard API Error:', error);
        return throwError(() => new Error('Error al cargar dashboard: ' + error.message));
      })
    );
  }

  // Método para forzar actualización
  refreshData(): Observable<DashboardResponse> {
    this.cache = null;
    return this.getDashboardData();
  }
}