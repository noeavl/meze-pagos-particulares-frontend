import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { usePago } from '../../hooks/use-pago.hook';
import { METODOS_PAGO } from '../../../domain/entities/pago.entity';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-pagos-adeudos',
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    TooltipModule,
    RouterLink,
  ],
  templateUrl: './pagos-adeudos.html',
  styleUrl: './pagos-adeudos.css',
})
export class PagosAdeudos implements OnInit {
  pagoService = inject(usePago);
  
  // Filtros para pagos  
  selectedMetodoPago: string = '';
  selectedNivelPago: string = '';
  selectedGradoPago: string = '';
  searchTermPagos: string = '';
  
  // Opciones de filtros
  nivelOptions = [
    { label: 'Preescolar', value: 'preescolar' },
    { label: 'Primaria', value: 'primaria' },
    { label: 'Secundaria', value: 'secundaria' },
    { label: 'Bachillerato', value: 'bachillerato' },
    { label: 'Bachillerato Sabatino', value: 'bachillerato_sabatino' }
  ];
  
  gradosPorNivel = {
    'preescolar': [1, 2, 3],
    'primaria': [1, 2, 3, 4, 5, 6],
    'secundaria': [1, 2, 3],
    'bachillerato': [1, 2, 3, 4, 5, 6],
    'bachillerato_sabatino': [1, 2, 3, 4, 5, 6]
  };
  
  metodoOptions = METODOS_PAGO;

  constructor() {}

  ngOnInit() {
    this.pagoService.loadPagos();
  }

  get loading() {
    return this.pagoService.loading();
  }

  get error() {
    return this.pagoService.error();
  }
  
  get availableGradoOptionsPagos(): number[] {
    if (!this.selectedNivelPago) return [];
    return this.gradosPorNivel[this.selectedNivelPago as keyof typeof this.gradosPorNivel] || [];
  }

  // Getters para pagos
  get pagos() {
    return this.pagoService.pagos();
  }

  get filteredPagos() {
    let filtered = this.pagos;
    
    if (this.selectedMetodoPago) {
      filtered = filtered.filter(pago => pago.metodo === this.selectedMetodoPago);
    }
    
    if (this.selectedNivelPago) {
      filtered = filtered.filter(pago => pago.estudiante.nivel.rawValue === this.selectedNivelPago);
    }
    
    if (this.selectedGradoPago) {
      filtered = filtered.filter(pago => pago.estudiante.grado.toString() === this.selectedGradoPago);
    }
    
    if (this.searchTermPagos.trim()) {
      filtered = filtered.filter(pago => 
        pago.estudiante.nombres.toLowerCase().includes(this.searchTermPagos.toLowerCase()) ||
        pago.estudiante.apellidoPaterno.toLowerCase().includes(this.searchTermPagos.toLowerCase()) ||
        pago.folio.toLowerCase().includes(this.searchTermPagos.toLowerCase())
      );
    }
    
    return filtered;
  }

  get totalPagos() {
    return this.filteredPagos.reduce((sum, pago) => sum + pago.monto, 0);
  }

  // Métodos de filtrado
  onSearchPagos(event: any) {
    this.searchTermPagos = event.target.value;
  }
  
  onNivelChangePagos() {
    this.selectedGradoPago = '';
  }

  getMetodoSeverity(metodo: string): 'success' | 'info' {
    switch (metodo) {
      case 'transferencia':
        return 'info';
      case 'efectivo':
        return 'success';
      default:
        return 'info';
    }
  }
}