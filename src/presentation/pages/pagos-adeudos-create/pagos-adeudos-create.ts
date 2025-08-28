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
import { usePago } from '../../hooks/use-pago.hook';
import { CreatePagoAdeudoDto } from '../../../domain/entities/pago.entity';

@Component({
  selector: 'app-pagos-adeudos-create',
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
  ],
  templateUrl: './pagos-adeudos-create.html',
  styleUrl: './pagos-adeudos-create.css',
})
export class PagosAdeudosCreate implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  public adeudoService = inject(useAdeudo);
  public pagoService = inject(usePago);

  pagoForm!: FormGroup;
  adeudoId: number = 0;

  // Connect component signals to the appropriate hooks
  adeudo = this.adeudoService.adeudo;
  loading = this.pagoService.loading; // Use loading state from pagoService
  error = this.pagoService.error; // Use error state from pagoService

  // Mock data
  pagos: any[] = [];
  paymentOptions = [
    { name: 'Efectivo', value: 'efectivo' },
    { name: 'Transferencia', value: 'transferencia' },
  ];

  constructor() {
    this.initForm();
  }

  ngOnInit() {
    // Load initial adeudo information
    this.adeudoId = Number(this.route.snapshot.params['id']);
    if (this.adeudoId) {
      this.adeudoService.getAdeudoById(this.adeudoId).subscribe({
        error: (err) => {
          // Handle error loading initial data
          this.error.set('No se pudo cargar la información del adeudo.');
        },
      });
    } else {
      this.error.set('No se proporcionó un ID de adeudo válido.');
      this.router.navigate(['/adeudos']);
    }

    // Example payment history
    this.pagos = [
      {
        folio: 'P2024-001',
        monto: 1500.0,
        metodo_pago: 'Efectivo',
        fecha: '2024-08-27',
      },
    ];
  }

  private initForm() {
    this.pagoForm = this.fb.group({
      folio: ['', Validators.required],
      fecha: [new Date(), Validators.required],
      metodo_pago: ['', Validators.required],
      monto: [null, [Validators.required, Validators.min(0.01)]],
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
      folio: formValue.folio,
      monto: formValue.monto,
      metodo_pago: formValue.metodo_pago,
      fecha: formValue.fecha.toISOString().split('T')[0],
    };

    // this.pagoService.createPago(pagoData).subscribe({
    //   next: () => {
    //     console.log('Pago creado exitosamente, redirigiendo...');
    //     this.router.navigate(['/adeudos']);
    //   },
    //   error: (err: HttpErrorResponse) => {
    //     console.error('Error caught in component:', err);
    //   },
    // });
  }
}
