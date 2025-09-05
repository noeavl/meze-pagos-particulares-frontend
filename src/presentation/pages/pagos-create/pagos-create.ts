import { Component, inject, OnInit } from '@angular/core';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { CommonModule } from '@angular/common';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { PaginatorModule } from 'primeng/paginator';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { useAdeudo } from '../../hooks/use-adeudo.hook';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { usePago } from '../../hooks/use-pago.hook';
import { CreatePagoAdeudoDto } from '../../../domain/entities/pago.entity';

@Component({
  selector: 'app-pagos-create',
  imports: [
    InputGroupAddonModule,
    InputGroupModule,
    CommonModule,
    InputNumberModule,
    InputTextModule,
    SelectModule,
    DatePickerModule,
    ButtonModule,
    CardModule,
    TableModule,
    PaginatorModule,
    RouterLink,
    ProgressSpinnerModule,
    ReactiveFormsModule,
    ToastModule,
  ],
  templateUrl: './pagos-create.html',
  styleUrl: './pagos-create.css',
  providers: [MessageService],
})
export class PagosCreate implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private messageService = inject(MessageService);
  public adeudoService = inject(useAdeudo);
  public pagoService = inject(usePago);

  pagoForm!: FormGroup;
  adeudoId: number = 0;

  // Connect component signals to the appropriate hooks
  adeudo = this.adeudoService.adeudo;
  paymentHistory = this.adeudoService.paymentHistory;
  loading = this.pagoService.loading; // Use loading state from pagoService
  error = this.pagoService.error; // Use error state from pagoService
  validationErrors = this.pagoService.validationErrors; // Use validation errors from pagoService
  paymentOptions = [
    { name: 'Efectivo', value: 'efectivo' },
    { name: 'Transferencia', value: 'transferencia' },
  ];

  constructor() {
    this.initForm();
    this.setupFormSubscriptions();
  }

  ngOnInit() {
    // Load initial adeudo information
    this.adeudoId = Number(this.route.snapshot.params['id']);
    if (this.adeudoId) {
      // Load adeudo details (which now includes pagos)
      this.adeudoService.getAdeudoById(this.adeudoId).subscribe({
        next: (adeudo) => {
          // Set payment history from adeudo response
          if (adeudo.pagos) {
            this.adeudoService.paymentHistory.set(adeudo.pagos);
          }
        },
        error: (err) => {
          // Handle error loading initial data
          this.error.set('No se pudo cargar la información del adeudo.');
        },
      });
    } else {
      this.error.set('No se proporcionó un ID de adeudo válido.');
      this.router.navigate(['/adeudos']);
    }
  }

  private initForm() {
    this.pagoForm = this.fb.group({
      folio: ['', Validators.required],
      fecha: [new Date(), Validators.required],
      metodo_pago: ['', Validators.required],
      monto: [null, [Validators.required, Validators.min(0.01)]],
    });
  }

  private setupFormSubscriptions() {
    // Clear validation errors when folio field changes
    this.pagoForm.get('folio')?.valueChanges.subscribe(() => {
      if (this.hasFieldError('folio')) {
        this.pagoService.validationErrors.set(null);
      }
    });
  }

  onSubmit() {
    if (this.pagoForm.invalid) {
      this.pagoForm.markAllAsTouched();
      this.error.set('Por favor, complete todos los campos requeridos.');
      return;
    }

    const formValue = this.pagoForm.value;

    const pagoData: CreatePagoAdeudoDto = {
      adeudo_id: this.adeudoId,
      estudiante_id: this.adeudo()?.estudiante?.id || 0,
      folio: formValue.folio,
      monto: formValue.monto,
      metodo_pago: formValue.metodo_pago,
      fecha: formValue.fecha.toISOString().split('T')[0],
    };

    this.pagoService.createPago(pagoData).subscribe({
      next: (response) => {
        console.log('Pago creado exitosamente:', response.message);
        
        // Mostrar toast de éxito
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: response.message || 'Pago registrado exitosamente',
          life: 1500
        });
        
        // Wait a moment to show success, then redirect to adeudos list
        setTimeout(() => {
          this.router.navigate(['/adeudos']);
        }, 1500);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error caught in component:', err);
        // El hook ya maneja los errores específicos, no sobrescribir aquí
      },
    });
  }

  getFieldError(fieldName: string): string | null {
    const errors = this.validationErrors();
    if (errors && errors[fieldName] && errors[fieldName].length > 0) {
      return errors[fieldName][0]; // Return first error message
    }
    return null;
  }

  hasFieldError(fieldName: string): boolean {
    return this.getFieldError(fieldName) !== null;
  }
}
