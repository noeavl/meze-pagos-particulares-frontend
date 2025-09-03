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

  ngOnInit() {}

  isInvalid(fieldName: string): boolean {
    const field = this.cicloEscolarForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getErrorMessage(fieldName: string): string {
    const field = this.cicloEscolarForm.get(fieldName);
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
    };
    return labels[fieldName] || fieldName;
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
          let errorMessage = 'Error al crear el ciclo escolar';
          if (error?.error?.message === 'Ya existe un ciclo escolar con ese nombre') {
            errorMessage = 'Ya existe un ciclo escolar con ese nombre';
          }
          this.errorMessage = errorMessage;
          this.show('error', 'Error', this.errorMessage);
          console.error('Error al crear ciclo escolar:', error);
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