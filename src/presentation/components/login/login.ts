import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { useLogin } from '../../hooks/use-login.hook';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    MessageModule,
    ToastModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
  providers: [MessageService],
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private loginService = inject(useLogin);
  private messageService = inject(MessageService);

  exampleForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  loading = false;
  errorMessage = '';

  private show(severity: string, summary: string, detail: string) {
    const toastLife = 1500;
    this.messageService.add({
      severity: severity,
      summary: summary,
      detail: detail,
      key: 'br',
      life: toastLife,
    });
  }

  isInvalid(fieldName: string): boolean {
    const field = this.exampleForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  async onSubmit() {
    if (this.exampleForm.invalid) {
      this.exampleForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    try {
      const formValues = this.exampleForm.value;
      await this.loginService.login({
        email: formValues.email,
        password: formValues.password,
      });

      this.router.navigate(['/dashboard']);
    } catch (error: any) {
      this.errorMessage = '';
      const errorMessage = error.message || 'Error en el inicio de sesión';
      this.show('error', 'Error', errorMessage);
      console.error('Error en login:', error);
    } finally {
      this.loading = false;
    }
  }
}
