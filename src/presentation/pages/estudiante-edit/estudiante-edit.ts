import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';

import { InputText } from 'primeng/inputtext';
import { Card } from 'primeng/card';
import { ButtonModule } from 'primeng/button';

import { useEstudiante } from '../../hooks/use-estudiante.hook';
import { UpdateEstudianteDto, Estudiante } from '../../../domain/entities/estudiante.entity';

interface DropdownOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-estudiante-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, InputText, Card, ButtonModule],
  templateUrl: './estudiante-edit.html',
  styleUrl: './estudiante-edit.css',
})
export class EstudianteEdit implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private estudianteService = inject(useEstudiante);

  estudianteId: number = 0;
  estudiante: Estudiante | null = null;

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
  loadingData = true;
  errorMessage = '';

  ngOnInit() {
    this.estudianteId = Number(this.route.snapshot.params['id']);
    if (this.estudianteId) {
      this.loadEstudiante();
    } else {
      this.errorMessage = 'ID de estudiante no válido';
      this.loadingData = false;
    }
  }

  loadEstudiante() {
    this.loadingData = true;
    this.estudianteService.getEstudianteById(this.estudianteId).subscribe({
      next: (estudiante: Estudiante) => {
        this.estudiante = estudiante;
        this.populateForm(estudiante);
        this.loadingData = false;
      },
      error: (error: any) => {
        this.errorMessage = 'Error al cargar el estudiante';
        console.error('Error al cargar estudiante:', error);
        this.loadingData = false;
      },
    });
  }

  populateForm(estudiante: Estudiante) {
    this.estudianteForm.patchValue({
      nombres: estudiante.nombres,
      apellidoPaterno: estudiante.apellidoPaterno,
      apellidoMaterno: estudiante.apellidoMaterno,
      nivel: estudiante.nivel.rawValue,
      grado: estudiante.grado,
      modalidad: estudiante.modalidad.rawValue,
    });
  }

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

      const updateDto: UpdateEstudianteDto = {
        id: this.estudianteId,
        nombres: formValues.nombres.trim(),
        apellido_paterno: formValues.apellidoPaterno.trim(),
        apellido_materno: formValues.apellidoMaterno.trim(),
        nivel: formValues.nivel,
        grado: formValues.grado,
        modalidad: formValues.modalidad,
      };

      this.estudianteService.updateEstudiante(updateDto).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/estudiantes']);
        },
        error: (error: any) => {
          this.errorMessage = error.message || 'Error al actualizar el estudiante';
          console.error('Error al actualizar estudiante:', error);
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