import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TooltipModule } from 'primeng/tooltip';
import { usePago } from '../../hooks/use-pago.hook';
import { useEstudiante } from '../../hooks/use-estudiante.hook';
import { METODOS_PAGO, CreatePagoDto } from '../../../domain/entities/pago.entity';

@Component({
  selector: 'app-pagos-adeudos-create',
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    TooltipModule,
    RouterLink,
  ],
  templateUrl: './pagos-adeudos-create.html',
  styleUrl: './pagos-adeudos-create.css',
})
export class PagosAdeudosCreate implements OnInit {
  pagoService = inject(usePago);
  estudianteService = inject(useEstudiante);
  router = inject(Router);
  route = inject(ActivatedRoute);

  formData: CreatePagoDto = {
    estudiante_id: 0,
    folio: '',
    metodo: '',
    monto: '',
    fecha: new Date().toISOString().split('T')[0]
  };

  metodoOptions = METODOS_PAGO;
  
  // Selects dependientes
  selectedNivel: string = '';
  selectedGrado: string = '';
  selectedModalidad: string = '';
  selectedEstudiante: any = null;
  selectedMetodo: any = null;
  selectedDate: string = new Date().toISOString().split('T')[0];
  monto: number = 0;

  // Opciones para los selects
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

  modalidadOptions = [
    { label: 'Presencial', value: 'presencial' },
    { label: 'En Línea', value: 'en_linea' }
  ];

  constructor() {
    this.estudianteService.loadEstudiantes();
    this.generateFolio();
  }

  ngOnInit() {
    // Obtener parámetros de la URL si vienen desde adeudos
    this.route.queryParams.subscribe(params => {
      if (params['estudiante_id']) {
        const estudianteId = Number(params['estudiante_id']);
        this.preSelectEstudiante(estudianteId);
      }
      
      if (params['monto']) {
        this.monto = Number(params['monto']);
      }
    });
  }

  preSelectEstudiante(estudianteId: number) {
    // Función recursiva para esperar a que se carguen los estudiantes
    const trySelectEstudiante = () => {
      const estudiantes = this.estudianteService.estudiantes();
      if (estudiantes.length > 0) {
        const estudiante = estudiantes.find(est => est.id === estudianteId);
        if (estudiante) {
          // Pre-llenar los selects dependientes basándose en el estudiante
          this.selectedNivel = estudiante.nivel.rawValue;
          this.selectedGrado = estudiante.grado.toString();
          this.selectedModalidad = estudiante.modalidad.rawValue;
          this.selectedEstudiante = estudiante;
          return;
        }
      }
      // Si no se han cargado aún, intentar de nuevo en 500ms
      setTimeout(trySelectEstudiante, 500);
    };
    
    trySelectEstudiante();
  }

  // Getters para listas dependientes
  get availableGrados(): number[] {
    if (!this.selectedNivel) return [];
    return this.gradosPorNivel[this.selectedNivel as keyof typeof this.gradosPorNivel] || [];
  }

  get filteredEstudiantes() {
    if (!this.selectedNivel || !this.selectedGrado || !this.selectedModalidad) {
      return [];
    }

    return this.estudianteService.estudiantes()
      .filter(estudiante => 
        estudiante.nivel.rawValue === this.selectedNivel &&
        estudiante.grado.toString() === this.selectedGrado &&
        estudiante.modalidad.rawValue === this.selectedModalidad
      )
      .map(estudiante => ({
        label: `${estudiante.nombres} ${estudiante.apellidoPaterno}`,
        value: estudiante
      }));
  }

  get estudiantes() {
    return this.estudianteService.estudiantes().map(estudiante => ({
      label: `${estudiante.nombres} ${estudiante.apellidoPaterno} - ${estudiante.nivel.displayValue} ${estudiante.grado}°`,
      value: estudiante
    }));
  }

  // Métodos para manejar cambios en selects dependientes
  onNivelChange() {
    this.selectedGrado = '';
    this.selectedModalidad = '';
    this.selectedEstudiante = null;
  }

  onGradoChange() {
    this.selectedModalidad = '';
    this.selectedEstudiante = null;
  }

  onModalidadChange() {
    this.selectedEstudiante = null;
  }

  get loading() {
    return this.pagoService.loading();
  }

  get error() {
    return this.pagoService.error();
  }

  onSubmit() {
    if (this.isFormValid()) {
      this.formData = {
        estudiante_id: this.selectedEstudiante.id,
        folio: this.formData.folio,
        metodo: this.selectedMetodo.value,
        monto: this.monto.toString(),
        fecha: this.selectedDate
      };

      this.pagoService.createPago(this.formData)
        .then(() => {
          this.router.navigate(['/pagos-adeudos']);
        })
        .catch(() => {
          // Error handling is done in the service
        });
    }
  }

  isFormValid(): boolean {
    return !!(
      this.selectedEstudiante &&
      this.formData.folio?.trim() &&
      this.selectedMetodo &&
      this.monto > 0 &&
      this.selectedDate.trim()
    );
  }

  generateFolio() {
    const timestamp = new Date().getTime().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.formData.folio = `PAG-${timestamp}-${random}`;
  }
}