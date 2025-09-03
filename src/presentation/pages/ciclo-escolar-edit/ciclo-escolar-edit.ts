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
import { DatePicker } from 'primeng/datepicker';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { useCicloEscolar } from '../../hooks/use-ciclo-escolar.hook';
import {
  CicloEscolar,
  UpdateCicloEscolarDto,
} from '../../../domain/entities/ciclo-escolar.entity';

@Component({
  selector: 'app-ciclo-escolar-edit',
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
  templateUrl: './ciclo-escolar-edit.html',
  styleUrls: ['./ciclo-escolar-edit.css'],
  providers: [MessageService],
})
export class CicloEscolarEdit implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
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
  loadingData = true;
  errorMessage = '';
  cicloEscolarId: number = 0;
  currentCicloEscolar: CicloEscolar | null = null;

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cicloEscolarId = parseInt(id, 10);
      await this.loadCicloEscolar();
    } else {
      this.router.navigate(['/ciclos-escolares']);
    }
  }

  async loadCicloEscolar() {
    try {
      this.loadingData = true;

      this.cicloEscolarService.getCicloEscolarById(this.cicloEscolarId).subscribe({
        next: (cicloEscolar: CicloEscolar) => {
          this.currentCicloEscolar = cicloEscolar;
          this.populateForm(cicloEscolar);
          this.loadingData = false;
          this.cdr.detectChanges();
        },
        error: (error: any) => {
          console.error('Error al cargar ciclo escolar:', error);
          this.errorMessage = 'Error al cargar el ciclo escolar';
          this.show('error', 'Error', this.errorMessage);
          this.loadingData = false;
        },
      });
    } catch (error: any) {
      console.error('Error inesperado al cargar ciclo escolar:', error);
      this.errorMessage = 'Error inesperado al cargar el ciclo escolar';
      this.loadingData = false;
    }
  }

  populateForm(cicloEscolar: CicloEscolar) {
    this.cicloEscolarForm.patchValue({
      fechaInicio: new Date(cicloEscolar.fechaInicio),
      fechaFin: new Date(cicloEscolar.fechaFin),
    });
  }

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

      const updateDto: UpdateCicloEscolarDto = {
        id: this.cicloEscolarId,
        fecha_inicio: this.formatDateForAPI(formValues.fechaInicio),
        fecha_fin: this.formatDateForAPI(formValues.fechaFin),
      };

      this.cicloEscolarService.updateCicloEscolar(updateDto).subscribe({
        next: () => {
          this.loading = false;
          this.show(
            'success',
            'Completado',
            'Ciclo escolar actualizado exitosamente'
          );
          setTimeout(() => {
            this.router.navigate(['/ciclos-escolares']);
          }, 1500);
        },
        error: (error: any) => {
          this.errorMessage =
            error.message || 'Error al actualizar el ciclo escolar';
          this.show('error', 'Error', this.errorMessage);
          console.error('Error al actualizar ciclo escolar:', error);
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