import { Component, inject, OnInit, signal } from '@angular/core';
import { ButtonDirective } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { CommonModule } from '@angular/common';
import { MessageModule } from 'primeng/message';
import { useAdeudo } from '../../hooks/use-adeudo.hook';
import { Router } from '@angular/router';
import { ToastModule } from 'primeng/toast';

import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup,
} from '@angular/forms';
import { MessageService } from 'primeng/api';
@Component({
  selector: 'app-adeudos-create',
  imports: [
    ButtonDirective,
    InputNumberModule,
    CommonModule,
    ReactiveFormsModule,
    MessageModule,
    ToastModule,
  ],
  templateUrl: './adeudos-create.html',
  styleUrl: './adeudos-create.css',
  providers: [MessageService],
})
export class AdeudosCreate implements OnInit {
  adeudosGenerarForm!: FormGroup;
  successMessage = signal<string>('');
  private fb = inject(FormBuilder);
  private useAdeudoService = inject(useAdeudo);
  private router = inject(Router);
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
    setTimeout(() => {
      this.router.navigate(['/adeudos']);
    }, toastLife);
  }

  ngOnInit(): void {
    this.initForm();
  }

  volver() {
    this.router.navigate(['/adeudos']);
  }

  get loading() {
    return this.useAdeudoService.loading();
  }

  get error() {
    return this.useAdeudoService.error();
  }

  private initForm() {
    this.adeudosGenerarForm = this.fb.group({
      year: [
        '',
        [Validators.required, Validators.min(2000), Validators.max(9999)],
      ],
    });
  }

  get year() {
    return this.adeudosGenerarForm.get('year');
  }

  isInvalid(fieldName: string): boolean {
    const field = this.adeudosGenerarForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
  onSubmit() {
    if (this.adeudosGenerarForm.valid) {
      this.successMessage.set('');
      const formValue = this.adeudosGenerarForm.value;
      this.useAdeudoService
        .generateAdeudosMassive({ year: formValue.year })
        .subscribe({
          next: (response) => {
            this.successMessage.set(response.message);
            this.show('success', 'Exito', response.message);
            this.adeudosGenerarForm.reset();
          },
        });
    }
  }
}
