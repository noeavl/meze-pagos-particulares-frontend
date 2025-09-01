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
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { HttpErrorResponse } from '@angular/common/http';

import { InputText } from 'primeng/inputtext';
import { Password } from 'primeng/password';
import { ButtonDirective } from 'primeng/button';

import { useUser } from '../../hooks/use-user.hook';
import { UpdateUserDto, User } from '../../../domain/entities/user.entity';

@Component({
  selector: 'app-usuario-edit',
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
  templateUrl: './usuario-edit.html',
  styleUrl: './usuario-edit.css',
  providers: [MessageService],
})
export class UsuarioEdit implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private userService = inject(useUser);
  private messageService = inject(MessageService);

  usuarioForm!: FormGroup;
  loading = signal<boolean>(false);
  loadingData = signal<boolean>(false);
  error = signal<string | null>(null);
  validationErrors: { [key: string]: string[] } | null = null;
  usuarioId!: number;
  currentUser: User | null = null;

  ngOnInit() {
    this.usuarioId = Number(this.route.snapshot.params['id']);
    this.initializeForm();
    this.loadUser();
  }

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const passwordConfirmation = control.get('password_confirmation')?.value;
    
    // Solo validar si ambos campos tienen valor
    if (password && passwordConfirmation && password !== passwordConfirmation) {
      return { passwordMismatch: true };
    }
    
    return null;
  }

  private initializeForm() {
    this.usuarioForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: [''], // No required para edición
      password_confirmation: [''],
    }, { validators: this.passwordMatchValidator });

    // Agregar validación condicional para password_confirmation
    this.usuarioForm.get('password')?.valueChanges.subscribe(password => {
      const confirmationControl = this.usuarioForm.get('password_confirmation');
      if (password) {
        confirmationControl?.setValidators([Validators.required]);
      } else {
        confirmationControl?.clearValidators();
        confirmationControl?.setValue('');
      }
      confirmationControl?.updateValueAndValidity();
    });
  }

  private loadUser() {
    this.loadingData.set(true);
    this.error.set(null);

    this.userService.getUserById(this.usuarioId).subscribe({
      next: (user) => {
        this.currentUser = user;
        this.usuarioForm.patchValue({
          name: user.name,
          email: user.email,
        });
        this.loadingData.set(false);
      },
      error: (error) => {
        this.error.set('Error al cargar el usuario');
        this.show('error', 'Error', 'No se pudo cargar la información del usuario');
        this.loadingData.set(false);
      }
    });
  }

  onSubmit() {
    if (this.usuarioForm.invalid) {
      this.usuarioForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.validationErrors = null;

    const formValues = this.usuarioForm.value;
    const userData: UpdateUserDto = {
      name: formValues.name,
      email: formValues.email,
    };

    // Solo incluir password si se proporcionó
    if (formValues.password) {
      userData.password = formValues.password;
      userData.password_confirmation = formValues.password_confirmation;
    }

    this.userService.updateUser(this.usuarioId, userData).subscribe({
      next: (user) => {
        this.loading.set(false);
        this.show('success', 'Completado', 'Usuario actualizado correctamente');
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
            error.error?.message || 'Error al actualizar el usuario'
          );
          
          this.show(
            'error',
            'Error',
            this.error() || 'Error al actualizar el usuario'
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