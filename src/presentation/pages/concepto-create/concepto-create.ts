import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { useConcepto } from '../../hooks/use-concepto.hook';
import { Periodo } from '../../../domain/value-objects/periodo.value-object';
import { Nivel } from '../../../domain/value-objects/nivel.value-object';
import { Modalidad } from '../../../domain/value-objects/modalidad.value-object';

@Component({
  selector: 'app-concepto-create',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    ButtonModule,
    InputTextModule,
  ],
  templateUrl: './concepto-create.html',
  styleUrls: ['./concepto-create.css'],
})
export class ConceptoCreate implements OnInit {
  conceptoForm!: FormGroup;
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  periodos = Periodo.getAll();
  niveles = Nivel.getAll();
  modalidades = Modalidad.getAll();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private conceptoHook: useConcepto
  ) {}

  ngOnInit() {
    this.initForm();
  }

  private initForm() {
    this.conceptoForm = this.fb.group({
      nombre: ['', [Validators.required]],
      periodo: ['', [Validators.required]],
      nivel: ['general', [Validators.required]],
      modalidad: ['general', [Validators.required]],
      costo: [0, [Validators.required, Validators.min(0.01)]],
    });
  }

  onSubmit() {
    if (this.conceptoForm.valid) {
      this.loading.set(true);
      this.error.set(null);

      const formValue = this.conceptoForm.value;

      const conceptoData = {
        ...formValue,
        nivel: formValue.nivel,
        modalidad: formValue.modalidad,
      };

      this.conceptoHook.createConcepto(conceptoData).subscribe({
        next: () => {
          this.router.navigate(['/conceptos']);
        },
        error: (err) => {
          this.error.set('Error al crear el concepto: ' + err.message);
          this.loading.set(false);
        },
      });
    }
  }
}
