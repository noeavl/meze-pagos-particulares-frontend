import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { Select } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { useConcepto } from '../../hooks/use-concepto.hook';
import { Periodo } from '../../../domain/value-objects/periodo.value-object';
import { Nivel } from '../../../domain/value-objects/nivel.value-object';
import { Modalidad } from '../../../domain/value-objects/modalidad.value-object';
import { CreateConceptoDto } from '../../../domain/entities/concepto.entity';

@Component({
  selector: 'app-concepto-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    ButtonModule,
    InputTextModule,
    ProgressSpinnerModule,
    Select,
    InputNumberModule,
    ToastModule,
  ],
  templateUrl: './concepto-create.html',
  styleUrls: ['./concepto-create.css'],
  providers: [MessageService],
})
export class ConceptoCreate implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private conceptoService = inject(useConcepto);
  private cdr = inject(ChangeDetectorRef);
  private messageService = inject(MessageService);

  show(severity: string, summary: string, detail: string) {
    const toastLife = 1500;
    this.messageService.add({
      severity: severity,
      summary: summary,
      detail: detail,
      key: 'br',
      life: toastLife,
    });
  }

  conceptoForm: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    tipo: ['', [Validators.required]],
    periodo: ['', [Validators.required]],
    nivel: [''],
    modalidad: [''],
    costo: [0, [Validators.required, Validators.min(0.01)]],
  });

  tipos = [
    { value: 'adeudo', displayValue: 'Adeudo' },
    { value: 'requerido', displayValue: 'Requerido' }
  ];
  periodos = Periodo.getAll();
  niveles = Nivel.getAll();
  modalidades = Modalidad.getAll();

  loading = false;
  loadingData = false; // No data to load on create page
  errorMessage = '';

  ngOnInit() {}

  isInvalid(fieldName: string): boolean {
    const field = this.conceptoForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getErrorMessage(fieldName: string): string {
    const field = this.conceptoForm.get(fieldName);
    if (!field || !field.errors) return '';

    const errors = field.errors;

    if (errors['required'])
      return `${this.getFieldLabel(fieldName)} es requerido`;
    if (errors['minlength'])
      return `${this.getFieldLabel(fieldName)} debe tener al menos ${
        errors['minlength'].requiredLength
      } caracteres`;
    if (errors['min'])
      return `${this.getFieldLabel(fieldName)} debe ser mayor a ${
        errors['min'].min
      }`;

    return 'Campo inválido';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      nombre: 'Nombre',
      tipo: 'Tipo',
      periodo: 'Periodo',
      nivel: 'Nivel',
      modalidad: 'Modalidad',
      costo: 'Costo',
    };
    return labels[fieldName] || fieldName;
  }

  async onSubmit() {
    if (this.conceptoForm.invalid) {
      this.conceptoForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    try {
      const formValues = this.conceptoForm.value;

      const createDto: CreateConceptoDto = {
        nombre: formValues.nombre,
        tipo: formValues.tipo,
        periodo: formValues.periodo,
        nivel: formValues.nivel || null,
        modalidad: formValues.modalidad || null,
        costo: formValues.costo,
      };

      this.conceptoService.createConcepto(createDto).subscribe({
        next: () => {
          this.loading = false;
          this.show(
            'success',
            'Completado',
            'Concepto creado exitosamente'
          );
          setTimeout(() => {
            this.router.navigate(['/conceptos']);
          }, 1500);
        },
        error: (error: any) => {
          this.errorMessage =
            error.message || 'Error al crear el concepto';
          this.show('error', 'Error', this.errorMessage);
          console.error('Error al crear concepto:', error);
          this.loading = false;
        },
      });
    } catch (error: any) {
      this.errorMessage = error.message || 'Error inesperado';
      console.error('Error inesperado:', error);
      this.loading = false;
    }
  }

  onCancel() {
    this.router.navigate(['/conceptos']);
  }
}