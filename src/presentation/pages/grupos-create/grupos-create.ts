import { Component, OnInit, inject } from '@angular/core';
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
import { Select } from 'primeng/select';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { useGrupo } from '../../hooks/use-grupo.hook';
import { useNivel } from '../../hooks/use-nivel.hook';
import { useModalidad } from '../../hooks/use-modalidad.hook';
import { useGrado } from '../../hooks/use-grado.hook';
import { CreateGrupoDto } from '../../../domain/entities/grupo.entity';
import { CicloEscolar } from '../../../domain/entities/ciclo-escolar.entity';
import { CicloEscolarUseCase } from '../../../domain/use-cases/ciclo-escolar.use-case';

interface DropdownOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-grupo-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    ButtonModule,
    InputTextModule,
    Select,
    ProgressSpinnerModule,
    ToastModule,
  ],
  templateUrl: './grupos-create.html',
  styleUrls: ['./grupos-create.css'],
  providers: [MessageService],
})
export class GrupoCreate implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private grupoService = useGrupo();
  private cicloEscolarUseCase = inject(CicloEscolarUseCase);
  private nivelService = inject(useNivel);
  private modalidadService = inject(useModalidad);
  private gradoService = inject(useGrado);
  private messageService = inject(MessageService);

  grupoForm: FormGroup = this.fb.group({
    nombre: ['', [Validators.required]],
    ciclo_escolar_id: [null, [Validators.required]],
    nivel_id: ['', [Validators.required]],
    grado_id: [{ value: '', disabled: true }, [Validators.required]],
    modalidad_id: ['', [Validators.required]],
  });

  ciclosEscolares: CicloEscolar[] = [];
  loading = false;
  errorMessage = '';
  fieldErrors: { [key: string]: string[] } = {};

  get nivelesOptions() {
    return this.nivelService.niveles()
      .filter(nivel => nivel.nombre !== 'general')
      .map(nivel => ({
        label: nivel.displayName,
        value: nivel.id.toString()
      }));
  }

  get gradosOptions() {
    return this.gradoService.getGradosOptions().map(grado => ({
      label: grado.label,
      value: grado.value.toString()
    }));
  }

  get modalidadOptions() {
    return this.modalidadService.modalidades()
      .filter(modalidad => modalidad.nombre !== 'general')
      .map(modalidad => ({
        label: modalidad.displayName,
        value: modalidad.id.toString()
      }));
  }

  ngOnInit() {
    this.loadCiclosEscolares();
    this.nivelService.loadNiveles();
    this.modalidadService.loadModalidades();
    this.gradoService.loadGradosByNivel('general');
    
    this.grupoForm.get('nivel_id')?.valueChanges.subscribe((nivelId) => {
      this.updateGradoOptions(nivelId);
    });
  }

  loadCiclosEscolares() {
    this.cicloEscolarUseCase.getAllCiclosEscolares().subscribe((data: CicloEscolar[]) => {
      this.ciclosEscolares = data;
    });
  }

  updateGradoOptions(nivelId: string) {
    const gradoControl = this.grupoForm.get('grado_id');
    if (nivelId) {
      // Buscar el nivel por ID para obtener el nombre
      const nivel = this.nivelService.niveles().find(n => n.id.toString() === nivelId);
      if (nivel) {
        this.gradoService.loadGradosByNivel(nivel.nombre);
      }
      gradoControl?.enable();
    } else {
      this.gradoService.loadGradosByNivel('general');
      gradoControl?.enable();
    }
    gradoControl?.setValue('');
  }

  show(severity: string, summary: string, detail: string) {
    this.messageService.add({ severity, summary, detail, key: 'br', life: 1500 });
  }

  isInvalid(fieldName: string): boolean {
    const field = this.grupoForm.get(fieldName);
    const hasServerError = this.fieldErrors[fieldName] && this.fieldErrors[fieldName].length > 0;
    const hasFieldError = field && field.invalid && (field.dirty || field.touched);
    return !!(hasServerError || hasFieldError);
  }

  getErrorMessage(fieldName: string): string {
    const field = this.grupoForm.get(fieldName);
    if (this.fieldErrors[fieldName]) {
      return this.fieldErrors[fieldName][0];
    }
    if (!field || !field.errors) return '';
    if (field.errors['required'])
      return `${this.getFieldLabel(fieldName)} es requerido`;
    return 'Campo inválido';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      nombre: 'Nombre',
      ciclo_escolar_id: 'Ciclo Escolar',
      nivel_id: 'Nivel',
      grado_id: 'Grado',
      modalidad_id: 'Modalidad',
    };
    return labels[fieldName] || fieldName;
  }

  private handleValidationErrors(error: any): void {
    if (error.status === 422 && error.error && error.error.errors) {
      this.fieldErrors = error.error.errors;
    } else {
      this.errorMessage = error.error?.message || error.message || 'Error al crear el grupo';
    }
  }

  onSubmit() {
    if (this.grupoForm.invalid) {
      this.grupoForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.fieldErrors = {};

    const formValues = this.grupoForm.value;
    const createDto: CreateGrupoDto = {
      nombre: formValues.nombre,
      ciclo_escolar_id: parseInt(formValues.ciclo_escolar_id),
      nivel_id: parseInt(formValues.nivel_id),
      grado_id: parseInt(formValues.grado_id),
      modalidad_id: parseInt(formValues.modalidad_id),
    };

    this.grupoService.createGrupo(createDto).subscribe({
      next: () => {
        this.loading = false;
        this.show('success', 'Completado', 'Grupo creado exitosamente');
        setTimeout(() => this.router.navigate(['/grupos']), 1500);
      },
      error: (error: any) => {
        this.handleValidationErrors(error);
        if (error.status === 422) {
          this.show('error', 'Error de validación', 'Revisa los campos marcados');
        } else {
          this.show('error', 'Error', this.errorMessage);
        }
        this.loading = false;
      },
    });
  }

  onCancel() {
    this.router.navigate(['/grupos']);
  }
}
