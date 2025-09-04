import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { useGrupo } from '../../hooks/use-grupo.hook';
import { Grupo, UpdateGrupoDto } from '../../../domain/entities/grupo.entity';

@Component({
  selector: 'app-grupo-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    ButtonModule,
    InputTextModule,
    ProgressSpinnerModule,
    ToastModule,
  ],
  templateUrl: './grupos-edit.html',
  styleUrls: ['./grupos-edit.css'],
  providers: [MessageService],
})
export class GrupoEdit implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private grupoService = useGrupo();
  private messageService = inject(MessageService);
  private cdr = inject(ChangeDetectorRef);

  grupoForm: FormGroup = this.fb.group({
    nombre: ['', [Validators.required]],
  });

  grupo: Grupo | null = null;
  loading = false;
  errorMessage = '';
  fieldErrors: { [key: string]: string[] } = {};

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    console.log('ID del parámetro:', id);
    if (id) {
      this.loadGrupo(+id);
    } else {
      console.error('No se encontró ID en la URL');
      this.loading = false;
      this.errorMessage = 'ID de grupo no válido';
    }
  }

  loadGrupo(id: number) {
    this.loading = true;
    this.errorMessage = '';
    console.log('Cargando grupo con ID:', id);
    
    // Timeout de seguridad
    const timeout = setTimeout(() => {
      console.warn('Timeout: La petición está tardando demasiado');
      this.loading = false;
      this.errorMessage = 'La petición está tardando demasiado. Verifica tu conexión.';
    }, 10000); // 10 segundos
    
    this.grupoService.getGrupoById(id).subscribe({
      next: (data: Grupo) => {
        clearTimeout(timeout);
        console.log('Grupo cargado exitosamente:', data);
        this.grupo = data;
        this.grupoForm.patchValue({ nombre: data.nombre });
        this.loading = false;
        console.log('Loading establecido a false:', this.loading);
        this.cdr.detectChanges();
      },
      error: (error) => {
        clearTimeout(timeout);
        console.error('Error al cargar grupo:', error);
        this.errorMessage = `Error al cargar el grupo: ${error.message || error}`;
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
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
      return `El nombre es requerido`;
    return 'Campo inválido';
  }

  private handleValidationErrors(error: any): void {
    if (error.status === 422 && error.error && error.error.errors) {
      this.fieldErrors = error.error.errors;
    } else {
      this.errorMessage = error.error?.message || error.message || 'Error al actualizar el grupo';
    }
  }

  onSubmit() {
    if (this.grupoForm.invalid || !this.grupo) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.fieldErrors = {};

    const updateDto: UpdateGrupoDto = {
      id: this.grupo.id,
      nombre: this.grupoForm.value.nombre,
    };

    this.grupoService.updateGrupo(updateDto).subscribe({
      next: () => {
        this.loading = false;
        this.show('success', 'Completado', 'Grupo actualizado exitosamente');
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
