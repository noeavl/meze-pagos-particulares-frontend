import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ChartModule } from 'primeng/chart';
import { ProgressBarModule } from 'primeng/progressbar';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { SkeletonModule } from 'primeng/skeleton';
import { DividerModule } from 'primeng/divider';
import { Subscription } from 'rxjs';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs/operators';
import { DashboardService, DashboardResponse } from '../../../infrastructure/api/dashboard.service';

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    CardModule,
    TableModule,
    TagModule,
    ChartModule,
    ProgressBarModule,
    ToastModule,
    SkeletonModule,
    DividerModule
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
  providers: [MessageService]
})
export class DashboardComponent implements OnInit, OnDestroy {
  private dashboardService = inject(DashboardService);
  private messageService = inject(MessageService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);
  private subscriptions = new Subscription();

  dashboardData: DashboardResponse | null = null;
  loading = true;
  error: string | null = null;

  chartOptions: any;
  doughnutChartOptions: any;
  barChartOptions: any;
  lineChartOptions: any;
  deudaPorConceptoChart: any;
  adeudosPorEstadoChart: any;
  ingresosChart: any;

  ngOnInit() {
    console.log('Dashboard ngOnInit called - starting data load');
    this.initChartOptions();
    this.loadDashboardData();
    
    // Suscribirse a eventos de navegación para siempre actualizar cuando se navega al dashboard
    this.subscriptions.add(
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd),
        filter((event: NavigationEnd) => {
          const isDashboardRoute = event.url === '/dashboard' || 
                                  event.url === '/' ||
                                  event.urlAfterRedirects === '/dashboard' ||
                                  event.urlAfterRedirects === '/';
          console.log('Navigation event:', { url: event.url, urlAfterRedirects: event.urlAfterRedirects, isDashboardRoute });
          return isDashboardRoute;
        })
      ).subscribe((event: NavigationEnd) => {
        console.log('Navigation to dashboard detected, forcing refresh');
        // Siempre invalidar caché y recargar datos frescos
        this.dashboardService.refreshData().subscribe({
          next: (data) => {
            this.dashboardData = data;
            this.prepareCharts();
            this.loading = false;
            this.cdr.detectChanges();
            console.log('Dashboard data refreshed on navigation', {
              ultimosPagos: data.listas?.ultimos_pagos?.length || 0,
              primerosDosPagos: data.listas?.ultimos_pagos?.slice(0, 2)
            });
          },
          error: (err) => {
            console.error('Error refreshing dashboard on navigation:', err);
            this.error = 'Error al cargar los datos del dashboard';
            this.loading = false;
            this.cdr.detectChanges();
          }
        });
      })
    );
  }

  loadDashboardData() {
    console.log('loadDashboardData called', { 
      hasExistingData: !!this.dashboardData, 
      currentLoading: this.loading 
    });
    
    // Solo mostrar loading si no hay datos en cache
    if (!this.dashboardData) {
      this.loading = true;
      console.log('Setting loading to true');
    }
    this.error = null;

    console.log('Making API call to dashboard service');
    const subscription = this.dashboardService.getDashboardData().subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.prepareCharts();
        this.loading = false;
        this.cdr.detectChanges();
        console.log('Dashboard data loaded successfully', { 
          hasData: !!this.dashboardData, 
          loading: this.loading,
          dataKeys: Object.keys(data),
          ultimosPagos: data.listas?.ultimos_pagos?.length || 0,
          primerosDosPagos: data.listas?.ultimos_pagos?.slice(0, 2)
        });
      },
      error: (err) => {
        console.error('Dashboard loading error:', err);
        this.error = 'Error al cargar los datos del dashboard';
        this.loading = false;
        this.cdr.detectChanges();
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los datos del dashboard',
          life: 3000
        });
      }
    });

    this.subscriptions.add(subscription);
  }

  initChartOptions() {
    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    };

    // Opciones específicas para gráfico doughnut
    this.doughnutChartOptions = {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 1,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 8,
            usePointStyle: true,
            font: {
              size: 11
            },
            boxWidth: 12
          }
        }
      },
      layout: {
        padding: {
          top: 5,
          bottom: 15,
          left: 15,
          right: 15
        }
      },
      cutout: '65%'
    };

    // Opciones específicas para gráfico de barras
    this.barChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value: any) {
              return '$' + value.toLocaleString();
            }
          }
        },
        x: {
          ticks: {
            maxRotation: 45,
            minRotation: 0
          }
        }
      }
    };

    // Opciones específicas para gráfico de líneas
    this.lineChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value: any) {
              return '$' + value.toLocaleString();
            }
          }
        }
      },
      elements: {
        point: {
          radius: 4,
          hoverRadius: 6
        }
      }
    };
  }

  prepareCharts() {
    console.log('prepareCharts called', { 
      hasData: !!this.dashboardData,
      loading: this.loading 
    });
    if (!this.dashboardData) return;

    // Gráfico de adeudos por estado
    this.adeudosPorEstadoChart = {
      labels: this.dashboardData.graficos.adeudos_por_estado.map(item => 
        item.estado === 'pendiente' ? 'Pendiente' : 'Pagado'
      ),
      datasets: [{
        data: this.dashboardData.graficos.adeudos_por_estado.map(item => item.count),
        backgroundColor: ['#ef4444', '#10b981'],
        borderColor: ['#dc2626', '#059669'],
        borderWidth: 2
      }]
    };

    // Gráfico de deuda por concepto
    this.deudaPorConceptoChart = {
      labels: this.dashboardData.graficos.deuda_por_concepto.map(item => item.concepto),
      datasets: [{
        label: 'Deuda Pendiente ($)',
        data: this.dashboardData.graficos.deuda_por_concepto.map(item => 
          parseFloat(item.total_pendiente)
        ),
        backgroundColor: [
          '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981', '#6366f1'
        ]
      }]
    };

    // Gráfico de ingresos últimos 30 días
    this.ingresosChart = {
      labels: this.dashboardData.graficos.ingresos_ultimos_30_dias.map(item => 
        new Date(item.fecha).toLocaleDateString('es-MX', { 
          day: '2-digit', 
          month: '2-digit' 
        })
      ),
      datasets: [{
        label: 'Ingresos ($)',
        data: this.dashboardData.graficos.ingresos_ultimos_30_dias.map(item => 
          parseFloat(item.total)
        ),
        backgroundColor: '#10b981',
        borderColor: '#059669',
        borderWidth: 2,
        fill: true
      }]
    };
  }

  formatCurrency(amount: string | number): string {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(num);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  getEstudianteFullName(estudiante: any): string {
    const { nombres, apellido_paterno, apellido_materno } = estudiante.persona;
    return `${nombres} ${apellido_paterno} ${apellido_materno}`;
  }

  getPaymentMethodTag(metodo: string): { severity: string; value: string } {
    switch (metodo.toLowerCase()) {
      case 'efectivo':
        return { severity: 'success', value: 'Efectivo' };
      case 'tarjeta':
        return { severity: 'info', value: 'Tarjeta' };
      case 'transferencia':
        return { severity: 'warning', value: 'Transferencia' };
      default:
        return { severity: 'secondary', value: metodo };
    }
  }

  refreshDashboard() {
    this.loading = true;
    this.error = null;

    const subscription = this.dashboardService.refreshData().subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.prepareCharts();
        this.loading = false;
        this.cdr.detectChanges();
        this.messageService.add({
          severity: 'success',
          summary: 'Actualizado',
          detail: 'Dashboard actualizado correctamente',
          life: 2000
        });
      },
      error: (err) => {
        this.error = 'Error al actualizar los datos del dashboard';
        this.loading = false;
        this.cdr.detectChanges();
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron actualizar los datos del dashboard'
        });
      }
    });

    this.subscriptions.add(subscription);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
