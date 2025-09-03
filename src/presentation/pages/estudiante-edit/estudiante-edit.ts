import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { ButtonDirective } from 'primeng/button';
import { ProgressSpinner } from 'primeng/progressspinner';

import { useEstudiante } from '../../hooks/use-estudiante.hook';
import {
  UpdateEstudianteDto,
  Estudiante,
} from '../../../domain/entities/estudiante.entity';

interface DropdownOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-estudiante-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    InputText,
    Select,
    ButtonDirective,
    ProgressSpinner,
    ToastModule,
  ],
  templateUrl: './estudiante-edit.html',
  styleUrl: './estudiante-edit.css',
  providers: [MessageService],
})
export class EstudianteEdit implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private estudianteService = inject(useEstudiante);
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

  estudianteId: number = 0;
  estudiante: Estudiante | null = null;

  estudianteForm: FormGroup = this.fb.group({
    nombres: ['', [Validators.required, Validators.minLength(2)]],
    apellidoPaterno: ['', [Validators.required, Validators.minLength(2)]],
    apellidoMaterno: ['', [Validators.minLength(2)]],
    curp: ['', [Validators.required, Validators.pattern(/^[A-Z]{4}[0-9]{6}[H,M][A-Z]{5}[0-9,A-Z]{2}$/)]],
    nivel: ['', [Validators.required]],
    grado: ['', [Validators.required]],
    modalidad: ['', [Validators.required]],
    grupo: [''],
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
    this.errorMessage = '';

    this.estudianteService.getEstudianteById(this.estudianteId).subscribe({
      next: (response: any) => {
        const estudiante = response;
        console.log('Estudiante extraído:', estudiante);
        this.estudiante = estudiante;
        this.populateForm(estudiante);
        this.loadingData = false;
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Error al cargar estudiante:', error);
        this.errorMessage = 'Error al cargar el estudiante';
        this.loadingData = false;
        this.cdr.detectChanges();
      },
      complete: () => {
        this.loadingData = false;
        this.cdr.detectChanges();
      },
    });
  }

  populateForm(estudiante: Estudiante) {
    try {
      this.estudianteForm.patchValue({
        nombres: estudiante.nombres,
        apellidoPaterno: estudiante.apellidoPaterno,
        apellidoMaterno: estudiante.apellidoMaterno,
        curp: estudiante.curp,
        nivel: estudiante.nivel.rawValue,
        grado: estudiante.grado,
        modalidad: estudiante.modalidad.rawValue,
        grupo: estudiante.grupo,
      });

      console.log(
        'Valores del formulario después de patchValue:',
        this.estudianteForm.value
      );
    } catch (error) {
      console.error('Error al popular formulario:', error);
      this.errorMessage = 'Error al cargar los datos del estudiante';
    }
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

      const updateDto: UpdateEstudianteDto = {
        id: this.estudianteId,
        nombres: formValues.nombres,
        apellido_paterno: formValues.apellidoPaterno,
        apellido_materno: formValues.apellidoMaterno,
        curp: formValues.curp,
        nivel: formValues.nivel,
        grado: formValues.grado,
        modalidad: formValues.modalidad,
        grupo: formValues.grupo,
      };

      this.estudianteService.updateEstudiante(updateDto).subscribe({
        next: () => {
          this.loading = false;
          this.show(
            'success',
            'Completado',
            'Estudiante actualizado exitosamente'
          );
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
            this.errorMessage =
              error.message || 'Error al actualizar el estudiante';
          }
          this.show('error', 'Error', this.errorMessage);
          console.error('Error al actualizar estudiante:', error);
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
