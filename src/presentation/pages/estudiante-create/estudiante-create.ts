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
import { useNivel } from '../../hooks/use-nivel.hook';
import { useModalidad } from '../../hooks/use-modalidad.hook';
import { useGrado } from '../../hooks/use-grado.hook';
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
  private nivelService = inject(useNivel);
  private modalidadService = inject(useModalidad);
  private gradoService = inject(useGrado);
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
    curp: ['', [Validators.required, Validators.pattern(/^[A-Z]{4}[0-9]{6}[H,M][A-Z]{5}[0-9,A-Z]{2}$/)]],
    nivel: ['', [Validators.required]],
    grado: [{ value: '', disabled: true }, [Validators.required]],
    modalidad: ['', [Validators.required]],
    grupo: [''],
  });

  get nivelesOptions() {
    return this.nivelService.niveles().map(nivel => ({
      label: nivel.displayName,
      value: nivel.nombre
    }));
  }

  get gradosOptions() {
    return this.gradoService.getGradosOptions();
  }


  get modalidadOptions() {
    return this.modalidadService.modalidades().map(modalidad => ({
      label: modalidad.displayName,
      value: modalidad.nombre
    }));
  }

  loading = false;
  errorMessage = '';

  ngOnInit() {
    this.nivelService.loadNiveles();
    this.modalidadService.loadModalidades();
    // Load default grados for general
    this.gradoService.loadGradosByNivel('general');
    this.estudianteForm.get('nivel')?.valueChanges.subscribe((nivel) => {
      this.updateGradoOptions(nivel);
    });
  }

  updateGradoOptions(nivel: string) {
    const gradoControl = this.estudianteForm.get('grado');
    if (nivel) {
      this.gradoService.loadGradosByNivel(nivel);
      gradoControl?.enable();
    } else {
      this.gradoService.loadGradosByNivel('general');
      gradoControl?.enable();
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
    if (errors['pattern'])
      return `El formato del ${this.getFieldLabel(fieldName)} no es válido`;
    if (errors['serverError'])
      return errors['serverError'];

    return 'Campo inválido';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      nombres: 'Nombres',
      apellidoPaterno: 'Apellido Paterno',
      apellidoMaterno: 'Apellido Materno',
      curp: 'CURP',
      nivel: 'Nivel',
      grado: 'Grado',
      modalidad: 'Modalidad',
      grupo: 'Grupo',
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
        curp: formValues.curp,
        nivel: formValues.nivel,
        grado: formValues.grado,
        modalidad: formValues.modalidad,
        grupo: formValues.grupo,
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
          this.loading = false;
          if (error.status === 422) {
            this.errorMessage = error.error.message;
            const errorFields = Object.keys(error.error.errors);
            errorFields.forEach(field => {
              const control = this.estudianteForm.get(field);
              if (control) {
                control.setErrors({ serverError: error.error.errors[field][0] });
              }
            });
          } else {
            this.errorMessage = error.message || 'Error al crear el estudiante';
          }
          this.show('error', 'Error', this.errorMessage);
          console.error('Error al crear estudiante:', error);
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
