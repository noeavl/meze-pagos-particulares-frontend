import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { useAdeudo } from '../../hooks/use-adeudo.hook';
import { Adeudo } from '../../../domain/entities/adeudo.entity';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-adeudos',
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
  templateUrl: './adeudos.html',
  styleUrl: './adeudos.css',
})
export class Adeudos implements OnInit {
  adeudoService = inject(useAdeudo);
  
  // Filtros y búsqueda
  selectedEstado: string = '';
  selectedNivel: string = '';
  selectedGrado: string = '';
  selectedModalidad: string = '';
  searchTerm: string = '';
  
  // Opciones de filtros
  estadoOptions = [
    { label: 'Pendiente', value: 'pendiente' },
    { label: 'Pagado', value: 'pagado' },
    { label: 'Vencido', value: 'vencido' }
  ];
  
  nivelOptions = [
    { label: 'Preescolar', value: 'preescolar' },
    { label: 'Primaria', value: 'primaria' },
    { label: 'Secundaria', value: 'secundaria' },
    { label: 'Bachillerato', value: 'bachillerato' },
    { label: 'Bachillerato Sabatino', value: 'bachillerato_sabatino' }
  ];

  modalidadOptions = [
    { label: 'Presencial', value: 'presencial' },
    { label: 'En Línea', value: 'en_linea' }
  ];
  
  // Mapeo de grados por nivel
  gradosPorNivel = {
    'preescolar': [1, 2, 3],
    'primaria': [1, 2, 3, 4, 5, 6],
    'secundaria': [1, 2, 3],
    'bachillerato': [1, 2, 3, 4, 5, 6],
    'bachillerato_sabatino': [1, 2, 3, 4, 5, 6]
  };

  constructor() {}

  ngOnInit() {
    this.adeudoService.loadAdeudos();
  }

  get adeudos() {
    return this.adeudoService.adeudos();
  }

  get loading() {
    return this.adeudoService.loading();
  }

  get error() {
    return this.adeudoService.error();
  }

  get filteredAdeudos() {
    let filtered = this.adeudos;
    
    // Filtrar por estado si está seleccionado
    if (this.selectedEstado) {
      filtered = filtered.filter(adeudo => adeudo.estado.displayValue.toLowerCase() === this.selectedEstado.toLowerCase());
    }
    
    // Filtrar por nivel si está seleccionado
    if (this.selectedNivel) {
      filtered = filtered.filter(adeudo => adeudo.estudiante.nivel.rawValue === this.selectedNivel);
    }
    
    // Filtrar por grado si está seleccionado
    if (this.selectedGrado) {
      filtered = filtered.filter(adeudo => adeudo.estudiante.grado.toString() === this.selectedGrado);
    }
    
    // Filtrar por modalidad si está seleccionada
    if (this.selectedModalidad) {
      filtered = filtered.filter(adeudo => adeudo.estudiante.modalidad.rawValue === this.selectedModalidad);
    }
    
    // Filtrar por término de búsqueda
    if (this.searchTerm.trim()) {
      filtered = filtered.filter(adeudo => 
        adeudo.estudiante.nombres.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        adeudo.estudiante.apellidoPaterno.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        adeudo.concepto.nombre.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  }

  get totalConceptos() {
    return this.filteredAdeudos.reduce((sum, adeudo) => sum + adeudo.montoTotal, 0);
  }

  get totalPagado() {
    return this.filteredAdeudos.reduce((sum, adeudo) => sum + adeudo.montoPagado, 0);
  }

  get totalPendiente() {
    return this.filteredAdeudos.reduce((sum, adeudo) => sum + adeudo.montoPendiente, 0);
  }

  onSearch(event: any) {
    this.searchTerm = event.target.value;
  }
  
  onEstadoChange() {
    // El filtro se aplica automáticamente a través del getter filteredAdeudos
  }
  
  get availableGradoOptions(): number[] {
    if (!this.selectedNivel) {
      return [];
    }
    return this.gradosPorNivel[this.selectedNivel as keyof typeof this.gradosPorNivel] || [];
  }
  
  onNivelChange() {
    // Reset grado selection when nivel changes
    this.selectedGrado = '';
    // El filtro se aplica automáticamente a través del getter filteredAdeudos
  }
  
  onGradoChange() {
    // El filtro se aplica automáticamente a través del getter filteredAdeudos
  }

  onModalidadChange() {
    // El filtro se aplica automáticamente a través del getter filteredAdeudos
  }
}