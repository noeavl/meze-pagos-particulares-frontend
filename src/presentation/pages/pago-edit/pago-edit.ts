import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { usePago } from '../../hooks/use-pago.hook';
import { useEstudiante } from '../../hooks/use-estudiante.hook';
import { METODOS_PAGO, UpdatePagoDto } from '../../../domain/entities/pago.entity';

@Component({
  selector: 'app-pago-edit',
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    RouterLink,
  ],
  templateUrl: './pago-edit.html',
  styleUrl: './pago-edit.css',
})
export class PagoEdit implements OnInit {
  pagoService = inject(usePago);
  estudianteService = inject(useEstudiante);
  router = inject(Router);
  route = inject(ActivatedRoute);

  pagoId: number = 0;
  formData: UpdatePagoDto = {
    id: 0,
    estudiante_id: 0,
    folio: '',
    metodo: '',
    monto: '',
    fecha: ''
  };

  metodoOptions = METODOS_PAGO;
  selectedEstudiante: any = null;
  selectedMetodo: any = null;
  selectedDate: string = new Date().toISOString().split('T')[0];
  monto: number = 0;
  isLoaded: boolean = false;

  constructor() {}

  ngOnInit() {
    this.pagoId = Number(this.route.snapshot.paramMap.get('id'));
    
    if (this.pagoId) {
      this.loadData();
    }
  }

  loadData() {
    this.estudianteService.loadEstudiantes();
    this.pagoService.loadPagoById(this.pagoId);
    
    // Wait for both data to load
    setTimeout(() => {
      const pago = this.pagoService.selectedPago();
      if (pago) {
        this.populateForm(pago);
      }
    }, 1000);
  }

  populateForm(pago: any) {
    this.formData = {
      id: pago.id,
      estudiante_id: pago.estudiante.id,
      folio: pago.folio,
      metodo: pago.metodo,
      monto: pago.monto.toString(),
      fecha: pago.fecha.toISOString().split('T')[0]
    };

    // Set form controls
    this.selectedEstudiante = pago.estudiante;
    this.selectedMetodo = this.metodoOptions.find(m => m.value === pago.metodo);
    this.selectedDate = pago.fecha.toISOString().split('T')[0];
    this.monto = pago.monto;
    this.isLoaded = true;
  }

  get estudiantes() {
    return this.estudianteService.estudiantes().map(estudiante => ({
      label: `${estudiante.nombres} ${estudiante.apellidoPaterno} - ${estudiante.nivel.displayValue} ${estudiante.grado}°`,
      value: estudiante
    }));
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
        id: this.pagoId,
        estudiante_id: this.selectedEstudiante.id,
        folio: this.formData.folio,
        metodo: this.selectedMetodo.value,
        monto: this.monto.toString(),
        fecha: this.selectedDate
      };

      this.pagoService.updatePago(this.formData)
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
}