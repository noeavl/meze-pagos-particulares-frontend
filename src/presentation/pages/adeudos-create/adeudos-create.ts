import { Component, inject, OnInit, signal } from '@angular/core';
import { ButtonDirective } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { CommonModule } from '@angular/common';
import { MessageModule } from 'primeng/message';
import { Select } from 'primeng/select';
import { useAdeudo } from '../../hooks/use-adeudo.hook';
import { useCicloEscolar } from '../../hooks/use-ciclo-escolar.hook';
import { useNivel } from '../../hooks/use-nivel.hook';
import { useModalidad } from '../../hooks/use-modalidad.hook';
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
    Select,
    ToastModule,
  ],
  templateUrl: './adeudos-create.html',
  styleUrl: './adeudos-create.css',
  providers: [MessageService],
})
export class AdeudosCreate implements OnInit {
  adeudosGenerarForm!: FormGroup;
  successMessage = signal<string>('');
  selectedCicloEscolar = signal<any>(null);
  private fb = inject(FormBuilder);
  private useAdeudoService = inject(useAdeudo);
  private useCicloEscolarService = inject(useCicloEscolar);
  private useNivelService = inject(useNivel);
  private useModalidadService = inject(useModalidad);
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
    this.useCicloEscolarService.loadCiclosEscolares();
    this.useNivelService.loadNiveles();
    this.useModalidadService.loadModalidades();
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

  get ciclosEscolares() {
    return this.useCicloEscolarService.ciclosEscolares();
  }

  get ciclosLoading() {
    return this.useCicloEscolarService.loading();
  }

  get niveles() {
    return this.useNivelService.niveles();
  }

  get modalidades() {
    return this.useModalidadService.modalidades();
  }

  get nivelesLoading() {
    return this.useNivelService.loading();
  }

  get modalidadesLoading() {
    return this.useModalidadService.loading();
  }

  private initForm() {
    this.adeudosGenerarForm = this.fb.group({
      ciclo_escolar_id: ['', Validators.required],
      nivel_id: ['', Validators.required],
      modalidad_id: ['', Validators.required],
    });
  }

  get cicloEscolarId() {
    return this.adeudosGenerarForm.get('ciclo_escolar_id');
  }

  get nivelId() {
    return this.adeudosGenerarForm.get('nivel_id');
  }

  get modalidadId() {
    return this.adeudosGenerarForm.get('modalidad_id');
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
        .generateAdeudosMassive({ 
          ciclo_escolar_id: formValue.ciclo_escolar_id,
          nivel_id: formValue.nivel_id,
          modalidad_id: formValue.modalidad_id
        })
        .subscribe({
          next: (response) => {
            this.successMessage.set(response.message);
            this.show('success', 'Exito', response.message);
            this.adeudosGenerarForm.reset();
            this.selectedCicloEscolar.set(null);
          },
        });
    }
  }

  onCicloEscolarChange(event: any) {
    const selectedCiclo = this.ciclosEscolares.find((ciclo: any) => ciclo.id === event.value);
    this.selectedCicloEscolar.set(selectedCiclo);
  }

  getYearFromDate(dateString: string): number {
    if (!dateString) return new Date().getFullYear();
    return new Date(dateString).getFullYear();
  }
}
