import { Component, inject, OnInit, signal } from '@angular/core';
import { ButtonDirective } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { CommonModule } from '@angular/common';
import { MessageModule } from 'primeng/message';
import { useAdeudo } from '../../hooks/use-adeudo.hook';
import { Router } from '@angular/router';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup,
} from '@angular/forms';
@Component({
  selector: 'app-adeudos-create',
  imports: [
    ButtonDirective,
    InputNumberModule,
    CommonModule,
    ReactiveFormsModule,
    MessageModule,
  ],
  templateUrl: './adeudos-create.html',
  styleUrl: './adeudos-create.css',
})
export class AdeudosCreate implements OnInit {
  adeudosGenerarForm!: FormGroup;
  successMessage = signal<string | null>(null);
  private fb = inject(FormBuilder);
  private useAdeudoService = inject(useAdeudo);
  private router = inject(Router);

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
      this.successMessage.set(null);
      const formValue = this.adeudosGenerarForm.value;
      this.useAdeudoService
        .generateAdeudosMassive({ year: formValue.year })
        .subscribe({
          next: (response) => {
            this.successMessage.set(
              response.message || 'Ya hay adeudos en este ciclo'
            );
            this.adeudosGenerarForm.reset();
          },
        });
    }
  }
}
