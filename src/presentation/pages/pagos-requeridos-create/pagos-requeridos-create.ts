import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { CommonModule } from '@angular/common';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { usePago } from '../../hooks/use-pago.hook';
import { CreatePagoRequeridoDto, METODOS_PAGO } from '../../../domain/entities/pago.entity';
import { useEstudiante } from '../../hooks/use-estudiante.hook';
import { useConcepto } from '../../hooks/use-concepto.hook';
import { Estudiante } from '../../../domain/entities/estudiante.entity';

@Component({
  selector: 'app-pagos-requeridos-create',
  imports: [
    InputGroupAddonModule,
    InputGroupModule,
    CommonModule,
    InputNumberModule,
    InputTextModule,
    SelectModule,
    DatePickerModule,
    ButtonModule,
    CardModule,
    ProgressSpinnerModule,
    ReactiveFormsModule,
    ToastModule,
  ],
  templateUrl: './pagos-requeridos-create.html',
  styleUrl: './pagos-requeridos-create.css',
  providers: [MessageService],
})
export class PagosRequeridosCreate implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private messageService = inject(MessageService);
  private cdr = inject(ChangeDetectorRef);
  
  pagoService = inject(usePago);
  estudianteService = inject(useEstudiante);
  conceptoService = inject(useConcepto);

  pagoForm: FormGroup;
  metodosOptions = METODOS_PAGO;
  
  // Estado del estudiante
  estudianteEncontrado: Estudiante | null = null;
  buscandoEstudiante = false;
  errorBusquedaEstudiante = '';
  

  constructor() {
    this.pagoForm = this.fb.group({
      curp: ['', [Validators.required, Validators.minLength(18), Validators.maxLength(18)]],
      estudiante_id: [null, [Validators.required]],
      concepto_id: [null, [Validators.required]],
      folio: ['', [Validators.required, Validators.minLength(3)]],
      monto: [null, [Validators.required, Validators.min(0.01)]],
      metodo_pago: ['', [Validators.required]],
      fecha: [new Date(), [Validators.required]]
    });
  }

  ngOnInit() {
    // Solo cargar conceptos, no estudiantes
    this.conceptoService.loadConceptos();
  }


  onCurpChange(event: any) {
    const curp = event.target.value.toUpperCase();
    this.pagoForm.patchValue({ curp: curp }, { emitEvent: false });
    
    // Limpiar estado si la CURP cambia
    if (curp.length !== 18) {
      this.estudianteEncontrado = null;
      this.errorBusquedaEstudiante = '';
      this.pagoForm.patchValue({ estudiante_id: null });
      this.cdr.detectChanges();
    }
  }

  buscarEstudiantePorCurp() {
    const curp = this.pagoForm.get('curp')?.value;
    if (!curp || curp.length !== 18) {
      return;
    }
    
    this.buscandoEstudiante = true;
    this.errorBusquedaEstudiante = '';
    this.cdr.detectChanges();
    
    this.estudianteService.getEstudianteByCurp(curp).subscribe({
      next: (estudiante) => {
        this.buscandoEstudiante = false;
        this.estudianteEncontrado = estudiante;
        this.errorBusquedaEstudiante = '';
        this.pagoForm.patchValue({ estudiante_id: estudiante.id });
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.buscandoEstudiante = false;
        // Mostrar el mensaje específico de la API o mensaje por defecto
        this.errorBusquedaEstudiante = error.error?.message || 'Estudiante no encontrado';
        this.estudianteEncontrado = null;
        this.pagoForm.patchValue({ estudiante_id: null });
        this.cdr.detectChanges();
      }
    });
  }

  get conceptos() {
    // Filtrar solo conceptos requeridos si tienen esa propiedad
    const allConceptos = this.conceptoService.conceptos();
    return allConceptos.filter(concepto => concepto.tipo === 'requerido');
  }

  get conceptosOptions() {
    return this.conceptos.map(concepto => {
      let label = concepto.nombre;
      
      // Agregar nivel si existe
      if (concepto.nivel) {
        label += ` (${concepto.nivel.displayValue})`;
      }
      
      // Agregar modalidad si existe
      if (concepto.modalidad) {
        label += ` - ${concepto.modalidad.displayValue}`;
      }
      
      // Agregar costo al final
      label += ` - $${concepto.costo}`;
      
      return {
        label,
        value: concepto.id,
        costo: concepto.costo
      };
    });
  }

  get loading() {
    return this.pagoService.loading();
  }

  get validationErrors() {
    return this.pagoService.validationErrors();
  }

  getFieldError(fieldName: string): string | null {
    const errors = this.pagoService.validationErrors();
    if (errors && errors[fieldName] && errors[fieldName].length > 0) {
      return errors[fieldName][0];
    }
    return null;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.pagoForm.get(fieldName);
    const hasBackendError = this.getFieldError(fieldName) !== null;
    return (field ? field.invalid && field.touched : false) || hasBackendError;
  }

  onSubmit() {
    if (this.pagoForm.valid) {
      const formValue = this.pagoForm.value;
      
      // Formatear la fecha
      const fecha = formValue.fecha instanceof Date 
        ? formValue.fecha.toISOString().split('T')[0]
        : formValue.fecha;

      const pagoData: CreatePagoRequeridoDto = {
        ...formValue,
        fecha
      };

      this.pagoService.createPagoRequerido(pagoData).subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: response.message || 'Pago requerido creado exitosamente'
          });
          this.router.navigate(['/pagos']);
        },
        error: (error: HttpErrorResponse) => {
          if (error.status !== 422) {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: this.pagoService.error() || 'Error al crear el pago requerido'
            });
          }
        }
      });
    } else {
      Object.keys(this.pagoForm.controls).forEach(key => {
        const control = this.pagoForm.get(key);
        if (control) {
          control.markAsTouched();
        }
      });
    }
  }

  onConceptoChange(conceptoId: number) {
    if (conceptoId) {
      const conceptoSeleccionado = this.conceptos.find(concepto => concepto.id === conceptoId);
      if (conceptoSeleccionado) {
        // Auto-rellenar el monto con el costo del concepto
        this.pagoForm.patchValue({
          monto: conceptoSeleccionado.costo
        });
      }
    } else {
      // Si no hay concepto seleccionado, limpiar el monto
      this.pagoForm.patchValue({
        monto: null
      });
    }
  }

  onCancel() {
    this.router.navigate(['/pagos']);
  }
}