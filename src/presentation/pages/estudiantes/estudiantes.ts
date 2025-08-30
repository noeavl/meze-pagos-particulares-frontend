import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { Select } from 'primeng/select';
import { useEstudiante } from '../../hooks/use-estudiante.hook';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-estudiantes',
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    TooltipModule,
    Select,
    RouterLink,
  ],
  templateUrl: './estudiantes.html',
  styleUrl: './estudiantes.css',
})
export class Estudiantes implements OnInit {
  estudianteService = inject(useEstudiante);

  // Filtros y búsqueda
  selectedNivel: string = '';
  selectedModalidad: string = '';
  selectedGrado: string = '';
  searchTerm: string = '';

  // Opciones de filtros
  nivelOptions = [
    { label: 'Todos los niveles', value: '' },
    { label: 'Preescolar', value: 'preescolar' },
    { label: 'Primaria', value: 'primaria' },
    { label: 'Secundaria', value: 'secundaria' },
    { label: 'Bachillerato', value: 'bachillerato' },
    { label: 'Bachillerato Sabatino', value: 'bachillerato_sabatino' },
  ];

  modalidadOptions = [
    { label: 'Todas las modalidades', value: '' },
    { label: 'Presencial', value: 'presencial' },
    { label: 'En Línea', value: 'en_linea' },
  ];

  gradosPorNivel = {
    preescolar: [1, 2, 3],
    primaria: [1, 2, 3, 4, 5, 6],
    secundaria: [1, 2, 3],
    bachillerato: [1, 2, 3, 4, 5, 6],
    bachillerato_sabatino: [1, 2, 3, 4, 5, 6],
  };

  constructor() {}

  ngOnInit() {
    this.estudianteService.loadEstudiantes();
  }

  estudiantes = this.estudianteService.estudiantes;
  loading = this.estudianteService.loading;
  error = this.estudianteService.error;

  get filteredEstudiantes() {
    let filtered = this.estudiantes();

    // Filtrar por nivel si está seleccionado
    if (this.selectedNivel) {
      filtered = filtered.filter(
        (estudiante) => estudiante.nivel.rawValue === this.selectedNivel
      );
    }

    // Filtrar por modalidad si está seleccionada
    if (this.selectedModalidad) {
      filtered = filtered.filter(
        (estudiante) => estudiante.modalidad.rawValue === this.selectedModalidad
      );
    }

    // Filtrar por grado si está seleccionado
    if (this.selectedGrado) {
      filtered = filtered.filter(
        (estudiante) => estudiante.grado.toString() === this.selectedGrado
      );
    }

    // Filtrar por término de búsqueda
    if (this.searchTerm.trim()) {
      filtered = filtered.filter(
        (estudiante) =>
          estudiante.nombres
            .toLowerCase()
            .includes(this.searchTerm.toLowerCase()) ||
          estudiante.apellidoPaterno
            .toLowerCase()
            .includes(this.searchTerm.toLowerCase()) ||
          estudiante.apellidoMaterno
            .toLowerCase()
            .includes(this.searchTerm.toLowerCase())
      );
    }

    return filtered;
  }

  get estudiantesPorNivel() {
    const conteos = {
      preescolar: 0,
      primaria: 0,
      secundaria: 0,
      bachillerato: 0,
      bachillerato_sabatino: 0,
    };

    this.filteredEstudiantes.forEach(estudiante => {
      const nivel = estudiante.nivel.rawValue as keyof typeof conteos;
      if (conteos.hasOwnProperty(nivel)) {
        conteos[nivel]++;
      }
    });

    return conteos;
  }

  get availableGradoOptions(): number[] {
    if (!this.selectedNivel) {
      return [];
    }
    return (
      this.gradosPorNivel[
        this.selectedNivel as keyof typeof this.gradosPorNivel
      ] || []
    );
  }

  get gradoOptionsForSelect() {
    const options = [{ label: 'Todos los grados', value: '' }];
    return options.concat(
      this.availableGradoOptions.map(grado => ({
        label: `${grado}°`,
        value: grado.toString()
      }))
    );
  }

  onSearch(event: any) {
    this.searchTerm = event.target.value;
  }

  onNivelChange() {
    // Reset grado selection when nivel changes
    this.selectedGrado = '';
  }

  onModalidadChange() {
    // El filtro se aplica automáticamente a través del getter filteredEstudiantes
  }

  onGradoChange() {
    // El filtro se aplica automáticamente a través del getter filteredEstudiantes
  }
}
