import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { InputText } from 'primeng/inputtext';
import { Card } from 'primeng/card';

import { useEstudiante } from '../../hooks/use-estudiante.hook';
import { CreateEstudianteDto } from '../../../domain/entities/estudiante.entity';

interface DropdownOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-estudiante-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, InputText, Card],
  templateUrl: './estudiante-create.html',
  styleUrl: './estudiante-create.css',
})
export class EstudianteCreate implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private estudianteService = inject(useEstudiante);

  estudianteForm: FormGroup = this.fb.group({
    nombres: ['', [Validators.required, Validators.minLength(2)]],
    apellidoPaterno: ['', [Validators.required, Validators.minLength(2)]],
    apellidoMaterno: ['', [Validators.minLength(2)]],
    nivel: ['', [Validators.required]],
    grado: ['', [Validators.required]],
    modalidad: ['', [Validators.required]],
  });

  nivelesOptions: DropdownOption[] = [
    { label: 'Preescolar', value: 'preescolar' },
    { label: 'Primaria', value: 'primaria' },
    { label: 'Secundaria', value: 'secundaria' },
    { label: 'Bachillerato', value: 'bachillerato' },
    { label: 'Bachillerato Sabatino', value: 'bachillerato_sabatino' },
  ];

  gradosOptions: DropdownOption[] = [
    { label: '1°', value: '1' },
    { label: '2°', value: '2' },
    { label: '3°', value: '3' },
    { label: '4°', value: '4' },
    { label: '5°', value: '5' },
    { label: '6°', value: '6' },
  ];

  modalidadOptions: DropdownOption[] = [
    { label: 'Presencial', value: 'presencial' },
    { label: 'En Línea', value: 'en_linea' },
  ];

  loading = false;
  errorMessage = '';

  ngOnInit() {}

  isInvalid(fieldName: string): boolean {
    const field = this.estudianteForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getErrorMessage(fieldName: string): string {
    const field = this.estudianteForm.get(fieldName);
    if (!field || !field.errors) return '';

    const errors = field.errors;

    if (errors['required'])
      return `${this.getFieldLabel(fieldName)} es requerido`;
    if (errors['minlength'])
      return `${this.getFieldLabel(fieldName)} debe tener al menos ${
        errors['minlength'].requiredLength
      } caracteres`;

    return 'Campo inválido';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      nombres: 'Nombres',
      apellidoPaterno: 'Apellido Paterno',
      apellidoMaterno: 'Apellido Materno',
      nivel: 'Nivel',
      grado: 'Grado',
      modalidad: 'Modalidad',
    };
    return labels[fieldName] || fieldName;
  }

  async onSubmit() {
    if (this.estudianteForm.invalid) {
      this.estudianteForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    try {
      const formValues = this.estudianteForm.value;

      const createDto: CreateEstudianteDto = {
        nombres: formValues.nombres.trim(),
        apellido_paterno: formValues.apellidoPaterno.trim(),
        apellido_materno: formValues.apellidoMaterno.trim(),
        nivel: formValues.nivel,
        grado: formValues.grado,
        modalidad: formValues.modalidad,
      };

      this.estudianteService.createEstudiante(createDto).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/estudiantes']);
        },
        error: (error: any) => {
          this.errorMessage = error.message || 'Error al crear el estudiante';
          console.error('Error al crear estudiante:', error);
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
    this.router.navigate(['/estudiantes']);
  }
}
