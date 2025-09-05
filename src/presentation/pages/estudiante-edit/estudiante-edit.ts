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
import { useNivel } from '../../hooks/use-nivel.hook';
import { useModalidad } from '../../hooks/use-modalidad.hook';
import { useGrado } from '../../hooks/use-grado.hook';
import {
  UpdateEstudianteDto,
  Estudiante,
} from '../../../domain/entities/estudiante.entity';
import { GrupoUseCase } from '../../../domain/use-cases/grupo.use-case';
import { Grupo } from '../../../domain/entities/grupo.entity';

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
  private nivelService = inject(useNivel);
  private modalidadService = inject(useModalidad);
  private gradoService = inject(useGrado);
  private grupoUseCase = inject(GrupoUseCase);
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
    grupo: [{ value: '', disabled: true }], // Campo opcional
  });

  get nivelesOptions() {
    return this.nivelService.niveles()
      .filter(nivel => nivel.nombre !== 'general')
      .map(nivel => ({
        label: nivel.displayName,
        value: nivel.nombre
      }));
  }

  get gradosOptions() {
    return this.gradoService.getGradosOptions();
  }

  get modalidadOptions() {
    return this.modalidadService.modalidades()
      .filter(modalidad => modalidad.nombre !== 'general')
      .map(modalidad => ({
        label: modalidad.displayName,
        value: modalidad.nombre
      }));
  }

  get gruposOptions() {
    return this.grupos.map(grupo => ({
      label: grupo.nombre,
      value: grupo.id.toString()
    }));
  }

  loading = false;
  loadingData = true;
  errorMessage = '';
  grupos: Grupo[] = [];
  gruposMessage = '';

  ngOnInit() {
    this.nivelService.loadNiveles();
    this.modalidadService.loadModalidades();
    this.gradoService.loadGradosByNivel('general');
    
    // Listeners para cambios de campos
    this.estudianteForm.get('nivel')?.valueChanges.subscribe((nivel) => {
      this.updateGradoOptions(nivel);
      this.checkAndLoadGrupos();
    });
    
    this.estudianteForm.get('grado')?.valueChanges.subscribe(() => {
      this.checkAndLoadGrupos();
    });
    
    this.estudianteForm.get('modalidad')?.valueChanges.subscribe(() => {
      this.checkAndLoadGrupos();
    });
    
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

  updateGradoOptions(nivel: string) {
    const gradoControl = this.estudianteForm.get('grado');
    if (nivel) {
      this.gradoService.loadGradosByNivel(nivel);
      gradoControl?.enable();
    } else {
      this.gradoService.loadGradosByNivel('general');
      gradoControl?.enable();
    }
    // No resetear el valor del grado aquí para que se mantenga cuando se carga el estudiante
  }

  checkAndLoadGrupos() {
    const nivel = this.estudianteForm.get('nivel')?.value;
    const grado = this.estudianteForm.get('grado')?.value;
    const modalidad = this.estudianteForm.get('modalidad')?.value;
    const grupoControl = this.estudianteForm.get('grupo');

    if (nivel && grado && modalidad && this.estudiante?.ciclo_escolar?.id) {
      // Buscar los IDs correspondientes
      const nivelObj = this.nivelService.niveles().find(n => n.nombre === nivel);
      const gradoObj = this.gradoService.getGradosOptions().find(g => g.value === grado);
      const modalidadObj = this.modalidadService.modalidades().find(m => m.nombre === modalidad);

      if (nivelObj && gradoObj && modalidadObj) {
        this.grupoUseCase.getGruposByParams(nivelObj.id, parseInt(gradoObj.value), modalidadObj.id, this.estudiante.ciclo_escolar.id)
          .subscribe({
            next: (grupos) => {
              this.grupos = grupos;
              if (grupos.length === 0) {
                this.gruposMessage = "Grupos no encontrados";
                grupoControl?.disable();
              } else {
                this.gruposMessage = "";
                grupoControl?.enable();
              }
              // No resetear la selección en el caso de editar para mantener el grupo actual
            },
            error: (error) => {
              console.error('Error al cargar grupos:', error);
              this.grupos = [];
              this.gruposMessage = "Grupos no encontrados";
              grupoControl?.disable();
            }
          });
      }
    } else {
      // Si no están los campos necesarios o el estudiante no está cargado, deshabilitar grupo
      this.grupos = [];
      this.gruposMessage = "";
      grupoControl?.disable();
    }
  }

  populateForm(estudiante: Estudiante) {
    try {
      // Primero cargar los grados del nivel correcto
      this.gradoService.loadGradosByNivel(estudiante.nivel.rawValue);
      
      // Usar setTimeout para esperar a que se carguen los grados
      setTimeout(() => {
        this.estudianteForm.patchValue({
          nombres: estudiante.nombres,
          apellidoPaterno: estudiante.apellidoPaterno,
          apellidoMaterno: estudiante.apellidoMaterno,
          curp: estudiante.curp,
          nivel: estudiante.nivel.rawValue,
          grado: estudiante.grado,
          modalidad: estudiante.modalidad.rawValue,
          grupo: estudiante.grupo_id ? estudiante.grupo_id.toString() : '',
        });

        // Actualizar validación del formulario
        this.estudianteForm.updateValueAndValidity();
        
        // Marcar campos como tocados para que se muestren las validaciones si hay errores
        if (this.estudianteForm.invalid) {
          this.estudianteForm.markAllAsTouched();
        }
        
        // Forzar detección de cambios
        this.cdr.detectChanges();

        console.log(
          'Valores del formulario después de patchValue:',
          this.estudianteForm.value
        );
        console.log('Form validity:', this.estudianteForm.valid);
        console.log('Form errors:', this.estudianteForm.errors);
        
        // Log individual field validation
        Object.keys(this.estudianteForm.controls).forEach(key => {
          const control = this.estudianteForm.get(key);
          if (control?.errors) {
            console.log(`${key} errors:`, control.errors);
          }
        });
      }, 100);
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
        grupo_id: formValues.grupo ? parseInt(formValues.grupo) : undefined,
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
