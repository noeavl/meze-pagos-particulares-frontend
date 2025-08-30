import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { ButtonDirective } from 'primeng/button';

import { useEstudiante } from '../../hooks/use-estudiante.hook';
import { CreateEstudianteDto } from '../../../domain/entities/estudiante.entity';

interface DropdownOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-estudiante-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    InputText,
    Select,
    ButtonDirective,
    ToastModule,
  ],
  templateUrl: './estudiante-create.html',
  styleUrl: './estudiante-create.css',
  providers: [MessageService],
})
export class EstudianteCreate implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private estudianteService = inject(useEstudiante);
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

  estudianteForm: FormGroup = this.fb.group({
    nombres: ['', [Validators.required, Validators.minLength(2)]],
    apellidoPaterno: ['', [Validators.required, Validators.minLength(2)]],
    apellidoMaterno: ['', [Validators.minLength(2)]],
    nivel: ['', [Validators.required]],
    grado: [{ value: '', disabled: true }, [Validators.required]],
    modalidad: ['', [Validators.required]],
  });

  nivelesOptions: DropdownOption[] = [
    { label: 'Preescolar', value: 'preescolar' },
    { label: 'Primaria', value: 'primaria' },
    { label: 'Secundaria', value: 'secundaria' },
    { label: 'Bachillerato', value: 'bachillerato' },
    { label: 'Bachillerato Sabatino', value: 'bachillerato_sabatino' },
  ];

  gradosPorNivel: { [key: string]: number[] } = {
    preescolar: [1, 2, 3],
    primaria: [1, 2, 3, 4, 5, 6],
    secundaria: [1, 2, 3],
    bachillerato: [1, 2, 3, 4, 5, 6],
    bachillerato_sabatino: [1, 2, 3, 4, 5, 6],
  };

  gradosOptions: DropdownOption[] = [];

  modalidadOptions: DropdownOption[] = [
    { label: 'Presencial', value: 'presencial' },
    { label: 'En Línea', value: 'en_linea' },
  ];

  loading = false;
  errorMessage = '';

  ngOnInit() {
    this.estudianteForm.get('nivel')?.valueChanges.subscribe((nivel) => {
      this.updateGradoOptions(nivel);
    });
  }

  updateGradoOptions(nivel: string) {
    const gradoControl = this.estudianteForm.get('grado');
    if (nivel) {
      const grados = this.gradosPorNivel[nivel] || [];
      this.gradosOptions = grados.map((grado) => ({
        label: `${grado}°`,
        value: grado.toString(),
      }));
      gradoControl?.enable();
    } else {
      this.gradosOptions = [];
      gradoControl?.disable();
    }
    gradoControl?.setValue('');
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

      const createDto: CreateEstudianteDto = {
        nombres: formValues.nombres,
        apellido_paterno: formValues.apellidoPaterno,
        apellido_materno: formValues.apellidoMaterno,
        nivel: formValues.nivel,
        grado: formValues.grado,
        modalidad: formValues.modalidad,
      };

      this.estudianteService.createEstudiante(createDto).subscribe({
        next: (response) => {
          this.loading = false;
          this.show('success', 'Completado', response.message);
          this.estudianteForm.reset();
          setTimeout(() => {
            this.router.navigate(['/estudiantes']);
          }, 1500);
        },
        error: (error: any) => {
          this.errorMessage = error.message || 'Error al crear el estudiante';
          this.show('error', 'Error', this.errorMessage);
          console.error('Error al crear estudiante:', error);
          this.loading = false;
        },
      });
    } catch (error: any) {
      this.errorMessage = error.message || 'Error inesperado';
      this.show('error', 'Error', this.errorMessage);
      console.error('Error inesperado:', error);
      this.loading = false;
    }
  }

  onCancel() {
    this.router.navigate(['/estudiantes']);
  }
}
