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
import { Select } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { useConcepto } from '../../hooks/use-concepto.hook';
import { Periodo } from '../../../domain/value-objects/periodo.value-object';
import { Nivel } from '../../../domain/value-objects/nivel.value-object';
import { Modalidad } from '../../../domain/value-objects/modalidad.value-object';
import {
  Concepto,
  UpdateConceptoDto,
} from '../../../domain/entities/concepto.entity';
import { NivelService } from '../../../infrastructure/api/nivel.service';
import { ModalidadEntityService } from '../../../infrastructure/api/modalidad-entity.service';

@Component({
  selector: 'app-concepto-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    ButtonModule,
    InputTextModule,
    ProgressSpinnerModule,
    Select,
    InputNumberModule,
    ToastModule,
  ],
  templateUrl: './concepto-edit.html',
  styleUrls: ['./concepto-edit.css'],
  providers: [MessageService],
})
export class ConceptoEdit implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private conceptoService = inject(useConcepto);
  private cdr = inject(ChangeDetectorRef);
  private messageService = inject(MessageService);
  private nivelService = inject(NivelService);
  private modalidadService = inject(ModalidadEntityService);

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

  conceptoId: number = 0;
  concepto: Concepto | null = null;

  conceptoForm: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    tipo: ['', [Validators.required]],
    periodo: ['', [Validators.required]],
    nivel: ['', [Validators.required]],
    modalidad: ['', [Validators.required]],
    costo: [0, [Validators.required, Validators.min(0.01)]],
  });

  tipos = [
    { value: 'adeudo', displayValue: 'Adeudo' },
    { value: 'requerido', displayValue: 'Requerido' }
  ];
  periodos = Periodo.getAll();
  niveles: any[] = [];
  modalidades: any[] = [];

  loading = false;
  loadingData = true;
  errorMessage = '';

  ngOnInit() {
    this.conceptoId = Number(this.route.snapshot.params['id']);
    if (this.conceptoId) {
      this.loadData();
    } else {
      this.errorMessage = 'ID de concepto no válido';
      this.loadingData = false;
    }
  }

  private loadData() {
    this.loadingData = true;
    
    // Load niveles and modalidades from API first
    Promise.all([
      this.nivelService.getAll().toPromise(),
      this.modalidadService.getAll().toPromise()
    ]).then(([niveles, modalidades]) => {
      this.niveles = niveles?.map(nivel => ({
        value: nivel.id,
        displayValue: Nivel.createFromRaw(nivel.nombre).displayValue
      })) || [];
      
      this.modalidades = modalidades?.map(modalidad => ({
        value: modalidad.id,
        displayValue: Modalidad.createFromRaw(modalidad.nombre).displayValue
      })) || [];
      
      // Now load the concepto
      this.loadConcepto();
    }).catch(error => {
      console.error('Error loading data:', error);
      this.errorMessage = 'Error al cargar los datos necesarios';
      this.loadingData = false;
      this.cdr.detectChanges();
    });
  }

  loadConcepto() {
    this.loadingData = true;
    this.errorMessage = '';

    this.conceptoService.getConceptoById(this.conceptoId).subscribe({
      next: (response: any) => {
        const concepto = response;
        console.log('Concepto extraído:', concepto);
        this.concepto = concepto;
        this.populateForm(concepto);
        this.loadingData = false;
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Error al cargar concepto:', error);
        this.errorMessage = 'Error al cargar el concepto';
        this.loadingData = false;
        this.cdr.detectChanges();
      },
      complete: () => {
        this.loadingData = false;
        this.cdr.detectChanges();
      },
    });
  }

  populateForm(concepto: Concepto) {
    try {
      // Find the IDs for nivel and modalidad by matching rawValue
      const nivelId = concepto.nivel ? 
        this.niveles.find(n => n.displayValue.toLowerCase() === concepto.nivel!.rawValue)?.value || null
        : null;
      
      const modalidadId = concepto.modalidad ? 
        this.modalidades.find(m => m.displayValue.toLowerCase() === concepto.modalidad!.rawValue)?.value || null
        : null;

      this.conceptoForm.patchValue({
        nombre: concepto.nombre,
        tipo: concepto.tipo,
        periodo: concepto.periodo.value,
        nivel: nivelId,
        modalidad: modalidadId,
        costo: concepto.costo,
      });

      console.log(
        'Valores del formulario después de patchValue:',
        this.conceptoForm.value
      );
    } catch (error) {
      console.error('Error al popular formulario:', error);
      this.errorMessage = 'Error al cargar los datos del concepto';
    }
  }

  isInvalid(fieldName: string): boolean {
    const field = this.conceptoForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getErrorMessage(fieldName: string): string {
    const field = this.conceptoForm.get(fieldName);
    if (!field || !field.errors) return '';

    const errors = field.errors;

    if (errors['required'])
      return `${this.getFieldLabel(fieldName)} es requerido`;
    if (errors['minlength'])
      return `${this.getFieldLabel(fieldName)} debe tener al menos ${
        errors['minlength'].requiredLength
      } caracteres`;
    if (errors['min'])
      return `${this.getFieldLabel(fieldName)} debe ser mayor a ${
        errors['min'].min
      }`;

    return 'Campo inválido';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      nombre: 'Nombre',
      tipo: 'Tipo',
      periodo: 'Periodo',
      nivel: 'Nivel',
      modalidad: 'Modalidad',
      costo: 'Costo',
    };
    return labels[fieldName] || fieldName;
  }

  async onSubmit() {
    if (this.conceptoForm.invalid) {
      this.conceptoForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    try {
      const formValues = this.conceptoForm.value;

      console.log('Valores del formulario:', formValues);

      const updateDto: UpdateConceptoDto = {
        id: this.conceptoId,
        nombre: formValues.nombre,
        tipo: formValues.tipo,
        periodo: formValues.periodo,
        nivel_id: formValues.nivel,
        modalidad_id: formValues.modalidad,
        costo: formValues.costo,
      };

      this.conceptoService.updateConcepto(updateDto).subscribe({
        next: () => {
          this.loading = false;
          this.show(
            'success',
            'Completado',
            'Concepto actualizado exitosamente'
          );
          setTimeout(() => {
            this.router.navigate(['/conceptos']);
          }, 1500);
        },
        error: (error: any) => {
          this.errorMessage =
            error.message || 'Error al actualizar el concepto';
          this.show('error', 'Error', this.errorMessage);
          console.error('Error al actualizar concepto:', error);
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
    this.router.navigate(['/conceptos']);
  }
}
