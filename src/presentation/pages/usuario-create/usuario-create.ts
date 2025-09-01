import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { HttpErrorResponse } from '@angular/common/http';

import { InputText } from 'primeng/inputtext';
import { Password } from 'primeng/password';
import { ButtonDirective } from 'primeng/button';

import { useUser } from '../../hooks/use-user.hook';
import { CreateUserDto } from '../../../domain/entities/user.entity';

@Component({
  selector: 'app-usuario-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    InputText,
    Password,
    ButtonDirective,
    ToastModule,
  ],
  templateUrl: './usuario-create.html',
  styleUrl: './usuario-create.css',
  providers: [MessageService],
})
export class UsuarioCreate implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private userService = inject(useUser);
  private messageService = inject(MessageService);

  usuarioForm!: FormGroup;
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  validationErrors: { [key: string]: string[] } | null = null;

  ngOnInit() {
    this.initializeForm();
  }

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const passwordConfirmation = control.get('password_confirmation')?.value;
    
    if (password && passwordConfirmation && password !== passwordConfirmation) {
      return { passwordMismatch: true };
    }
    
    return null;
  }

  private initializeForm() {
    this.usuarioForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      password_confirmation: ['', [Validators.required]],
    }, { validators: this.passwordMatchValidator });
  }

  onSubmit() {
    if (this.usuarioForm.invalid) {
      this.usuarioForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.validationErrors = null;

    const userData: CreateUserDto = this.usuarioForm.value;

    this.userService.createUser(userData).subscribe({
      next: (user) => {
        this.loading.set(false);
        this.show('success', 'Completado', 'Usuario creado correctamente');
        this.usuarioForm.reset();
        setTimeout(() => {
          this.router.navigate(['/usuarios']);
        }, 1500);
      },
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        
        if (error.status === 422 && error.error?.errors) {
          // Errores de validación del servidor
          this.validationErrors = error.error.errors;
          this.error.set(null); // No mostrar error general cuando hay errores de campo
          
          // Marcar todos los campos como tocados para mostrar errores
          this.usuarioForm.markAllAsTouched();
        } else {
          // Otros errores
          this.validationErrors = null;
          this.error.set(
            error.error?.message || 'Error al crear el usuario'
          );
          
          this.show(
            'error',
            'Error',
            this.error() || 'Error al crear el usuario'
          );
        }
      }
    });
  }

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
}