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
import { DatePicker } from 'primeng/datepicker';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { useCicloEscolar } from '../../hooks/use-ciclo-escolar.hook';
import { CreateCicloEscolarDto } from '../../../domain/entities/ciclo-escolar.entity';

@Component({
  selector: 'app-ciclo-escolar-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    ButtonModule,
    InputTextModule,
    DatePicker,
    ProgressSpinnerModule,
    ToastModule,
  ],
  templateUrl: './ciclo-escolar-create.html',
  styleUrls: ['./ciclo-escolar-create.css'],
  providers: [MessageService],
})
export class CicloEscolarCreate implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private cicloEscolarService = inject(useCicloEscolar);
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

  cicloEscolarForm: FormGroup = this.fb.group({
    fechaInicio: ['', [Validators.required]],
    fechaFin: ['', [Validators.required]],
  });

  loading = false;
  errorMessage = '';
  fieldErrors: { [key: string]: string[] } = {};

  ngOnInit() {}

  isInvalid(fieldName: string): boolean {
    const field = this.cicloEscolarForm.get(fieldName);
    const serverFieldName = this.mapFormFieldToServer(fieldName);
    const hasServerError =
      (this.fieldErrors[fieldName] && this.fieldErrors[fieldName].length > 0) ||
      (this.fieldErrors[serverFieldName] && this.fieldErrors[serverFieldName].length > 0);
    const hasFieldError =
      field && field.invalid && (field.dirty || field.touched);
    return !!(hasServerError || hasFieldError);
  }

  getErrorMessage(fieldName: string): string {
    const field = this.cicloEscolarForm.get(fieldName);
    const serverFieldName = this.mapFormFieldToServer(fieldName);

    // Priorizar errores del servidor
    if (this.fieldErrors[fieldName] && this.fieldErrors[fieldName].length > 0) {
      return this.fieldErrors[fieldName][0];
    }

    if (this.fieldErrors[serverFieldName] && this.fieldErrors[serverFieldName].length > 0) {
      return this.fieldErrors[serverFieldName][0];
    }

    if (!field || !field.errors) return '';

    const errors = field.errors;

    if (errors['required'])
      return `${this.getFieldLabel(fieldName)} es requerido`;

    return 'Campo inválido';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      fechaInicio: 'Fecha de inicio',
      fechaFin: 'Fecha de fin',
      fecha_inicio: 'Fecha de inicio',
      fecha_fin: 'Fecha de fin',
    };
    return labels[fieldName] || fieldName;
  }

  private clearFieldErrors(): void {
    this.fieldErrors = {};
  }

  private handleValidationErrors(error: any): void {
    if (error.status === 422 && error.error && error.error.errors) {
      this.fieldErrors = error.error.errors;
      // Marcar campos con errores del servidor como touched para mostrar errores
      Object.keys(this.fieldErrors).forEach((fieldName) => {
        const control =
          this.cicloEscolarForm.get(fieldName) ||
          this.cicloEscolarForm.get(this.mapServerFieldToForm(fieldName));
        if (control) {
          control.markAsTouched();
        }
      });
    } else {
      this.fieldErrors = {};
      this.errorMessage =
        error.error?.message ||
        error.message ||
        'Error al crear el ciclo escolar';
    }
  }

  private mapServerFieldToForm(serverField: string): string {
    const fieldMap: { [key: string]: string } = {
      fecha_inicio: 'fechaInicio',
      fecha_fin: 'fechaFin',
    };
    return fieldMap[serverField] || serverField;
  }

  private mapFormFieldToServer(formField: string): string {
    const fieldMap: { [key: string]: string } = {
      fechaInicio: 'fecha_inicio',
      fechaFin: 'fecha_fin',
    };
    return fieldMap[formField] || formField;
  }

  formatDateForAPI(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  async onSubmit() {
    if (this.cicloEscolarForm.invalid) {
      this.cicloEscolarForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.clearFieldErrors();

    try {
      const formValues = this.cicloEscolarForm.value;

      const createDto: CreateCicloEscolarDto = {
        fecha_inicio: this.formatDateForAPI(formValues.fechaInicio),
        fecha_fin: this.formatDateForAPI(formValues.fechaFin),
      };

      this.cicloEscolarService.createCicloEscolar(createDto).subscribe({
        next: () => {
          this.loading = false;
          this.show(
            'success',
            'Completado',
            'Ciclo escolar creado exitosamente'
          );
          setTimeout(() => {
            this.router.navigate(['/ciclos-escolares']);
          }, 1500);
        },
        error: (error: any) => {
          this.handleValidationErrors(error);

          if (error.status === 422) {
            this.show(
              'error',
              'Error de validación',
              'Por favor revisa los campos marcados en rojo'
            );
          } else {
            this.show('error', 'Error', this.errorMessage);
          }
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
    this.router.navigate(['/ciclos-escolares']);
  }
}