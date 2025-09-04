import { Component, OnInit, inject, ChangeDetectorRef } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import { Router, RouterLink, ActivatedRoute } from "@angular/router";
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { DatePicker } from "primeng/datepicker";
import { ProgressSpinnerModule } from "primeng/progressspinner";
import { ToastModule } from "primeng/toast";
import { MessageService } from "primeng/api";
import { useCicloEscolar } from "../../hooks/use-ciclo-escolar.hook";
import {
  CicloEscolar,
  UpdateCicloEscolarDto,
} from "../../../domain/entities/ciclo-escolar.entity";

@Component({
  selector: "app-ciclo-escolar-edit",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    ButtonModule,
    InputTextModule,
    DatePicker,
    ProgressSpinnerModule,
    ToastModule,
  ],
  templateUrl: "./ciclo-escolar-edit.html",
  styleUrls: ["./ciclo-escolar-edit.css"],
  providers: [MessageService],
})
export class CicloEscolarEdit implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cicloEscolarService = inject(useCicloEscolar);
  private cdr = inject(ChangeDetectorRef);
  private messageService = inject(MessageService);

  show(severity: string, summary: string, detail: string) {
    const toastLife = 1500;
    this.messageService.add({
      severity: severity,
      summary: summary,
      detail: detail,
      key: "br",
      life: toastLife,
    });
  }

  cicloEscolarForm: FormGroup = this.fb.group({
    fechaInicio: ["", [Validators.required]],
    fechaFin: ["", [Validators.required]],
  });

  loading = false;
  loadingData = true;
  errorMessage = "";
  fieldErrors: { [key: string]: string[] } = {};
  cicloEscolarId: number = 0;
  currentCicloEscolar: CicloEscolar | null = null;

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get("id");

    if (!id) {
      this.router.navigate(["/ciclos-escolares"]);
      return;
    }

    this.cicloEscolarId = parseInt(id, 10);
    if (isNaN(this.cicloEscolarId) || this.cicloEscolarId <= 0) {
      this.router.navigate(["/ciclos-escolares"]);
      return;
    }
    await this.loadCicloEscolar();
  }

  async loadCicloEscolar() {
    try {
      this.loadingData = true;
      this.currentCicloEscolar = null;

      this.cicloEscolarService
        .getCicloEscolarById(this.cicloEscolarId)
        .subscribe({
          next: (cicloEscolar: CicloEscolar) => {
            if (cicloEscolar && cicloEscolar.id) {
              this.currentCicloEscolar = cicloEscolar;
              this.populateForm(cicloEscolar);
            } else {
              this.errorMessage =
                "No se pudo cargar la información del ciclo escolar";
              this.show("error", "Error", this.errorMessage);
            }
            this.loadingData = false;
            this.cdr.detectChanges();
          },
          error: (error: any) => {
            this.currentCicloEscolar = null;
            this.errorMessage = "Error al cargar el ciclo escolar";
            this.show("error", "Error", this.errorMessage);
            this.loadingData = false;
            this.cdr.detectChanges();
          },
        });
    } catch (error: any) {
      this.currentCicloEscolar = null;
      this.errorMessage = "Error inesperado al cargar el ciclo escolar";
      this.loadingData = false;
    }
  }

  populateForm(cicloEscolar: CicloEscolar) {
    if (!cicloEscolar || !cicloEscolar.fechaInicio || !cicloEscolar.fechaFin) {
      return;
    }

    try {
      this.cicloEscolarForm.patchValue({
        fechaInicio: new Date(cicloEscolar.fechaInicio),
        fechaFin: new Date(cicloEscolar.fechaFin),
      });
    } catch (error) {
      this.errorMessage = "Error en el formato de las fechas del ciclo escolar";
    }
  }

  isInvalid(fieldName: string): boolean {
    const field = this.cicloEscolarForm.get(fieldName);
    const serverFieldName = this.mapFormFieldToServer(fieldName);
    const hasServerError =
      (this.fieldErrors[fieldName] && this.fieldErrors[fieldName].length > 0) ||
      (this.fieldErrors[serverFieldName] &&
        this.fieldErrors[serverFieldName].length > 0);
    const hasFieldError =
      field && field.invalid && (field.dirty || field.touched);
    return !!(hasServerError || hasFieldError);
  }

  getErrorMessage(fieldName: string): string {
    const field = this.cicloEscolarForm.get(fieldName);
    const serverFieldName = this.mapFormFieldToServer(fieldName);

    // Priorizar errores del servidor
    if (this.fieldErrors[fieldName] && this.fieldErrors[fieldName].length > 0) {
      return this.fieldErrors[fieldName][0];
    }

    if (
      this.fieldErrors[serverFieldName] &&
      this.fieldErrors[serverFieldName].length > 0
    ) {
      return this.fieldErrors[serverFieldName][0];
    }

    if (!field || !field.errors) return '';

    const errors = field.errors;

    if (errors['required'])
      return `${this.getFieldLabel(fieldName)} es requerido`;

    return 'Campo inválido';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      fechaInicio: "Fecha de inicio",
      fechaFin: "Fecha de fin",
      fecha_inicio: "Fecha de inicio",
      fecha_fin: "Fecha de fin",
    };
    return labels[fieldName] || fieldName;
  }

  getEstadoCiclo(): string {
    if (!this.currentCicloEscolar || !this.currentCicloEscolar.estado)
      return "inactivo";
    return this.currentCicloEscolar.estado;
  }

  getClaseEstado(estado: string): string {
    switch (estado) {
      case "activo":
        return "bg-green-100 text-green-800";
      case "proximo":
        return "bg-blue-100 text-blue-800";
      case "inactivo":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }

  getTextoEstado(estado: string): string {
    switch (estado) {
      case "activo":
        return "Activo";
      case "proximo":
        return "Próximo";
      case "inactivo":
        return "Inactivo";
      default:
        return "Desconocido";
    }
  }

  private clearFieldErrors(): void {
    this.fieldErrors = {};
  }

  private handleValidationErrors(error: any): void {
    if (error.status === 422 && error.error && error.error.errors) {
      this.fieldErrors = error.error.errors;
      // Marcar campos con errores del servidor como touched para mostrar errores
      Object.keys(this.fieldErrors).forEach((fieldName) => {
        const control =
          this.cicloEscolarForm.get(fieldName) ||
          this.cicloEscolarForm.get(this.mapServerFieldToForm(fieldName));
        if (control) {
          control.markAsTouched();
        }
      });
    } else {
      this.fieldErrors = {};
      this.errorMessage =
        error.error?.message ||
        error.message ||
        "Error al actualizar el ciclo escolar";
    }
  }

  private mapServerFieldToForm(serverField: string): string {
    const fieldMap: { [key: string]: string } = {
      fecha_inicio: "fechaInicio",
      fecha_fin: "fechaFin",
    };
    return fieldMap[serverField] || serverField;
  }

  private mapFormFieldToServer(formField: string): string {
    const fieldMap: { [key: string]: string } = {
      fechaInicio: 'fecha_inicio',
      fechaFin: 'fecha_fin',
    };
    return fieldMap[formField] || formField;
  }

  formatDateForAPI(date: Date): string {
    if (!date) {
      throw new Error("Fecha no válida");
    }

    try {
      return date.toISOString().split("T")[0];
    } catch (error) {
      throw new Error("Error al formatear fecha para API");
    }
  }

  async onSubmit() {
    if (this.cicloEscolarForm.invalid) {
      this.cicloEscolarForm.markAllAsTouched();
      return;
    }

    if (!this.currentCicloEscolar || !this.currentCicloEscolar.id) {
      this.errorMessage =
        "Error: No se ha cargado la información del ciclo escolar";
      this.show("error", "Error", this.errorMessage);
      return;
    }

    this.loading = true;
    this.errorMessage = "";
    this.clearFieldErrors();

    try {
      const formValues = this.cicloEscolarForm.value;

      // Verificar que las fechas existen
      if (!formValues.fechaInicio || !formValues.fechaFin) {
        this.errorMessage = "Error: Las fechas son requeridas";
        this.show("error", "Error", this.errorMessage);
        this.loading = false;
        return;
      }

      let updateDto: UpdateCicloEscolarDto;

      try {
        updateDto = {
          id: this.currentCicloEscolar.id || this.cicloEscolarId,
          fecha_inicio: this.formatDateForAPI(formValues.fechaInicio),
          fecha_fin: this.formatDateForAPI(formValues.fechaFin),
        };
      } catch (dateError: any) {
        this.errorMessage = `Error en las fechas: ${dateError.message}`;
        this.show("error", "Error", this.errorMessage);
        this.loading = false;
        return;
      }

      this.cicloEscolarService.updateCicloEscolar(updateDto).subscribe({
        next: () => {
          this.loading = false;
          this.show(
            "success",
            "Completado",
            "Ciclo escolar actualizado exitosamente"
          );
          setTimeout(() => {
            this.router.navigate(["/ciclos-escolares"]);
          }, 1500);
        },
        error: (error: any) => {
          
          this.handleValidationErrors(error);

          if (error.status === 422) {
            this.show(
              "error",
              "Error de validación",
              "Por favor revisa los campos marcados en rojo"
            );
          } else {
            this.show("error", "Error", this.errorMessage);
          }
          this.loading = false;
        },
      });
    } catch (error: any) {
      this.errorMessage = error.message || "Error inesperado";
      this.loading = false;
    }
  }

  onCancel() {
    this.router.navigate(["/ciclos-escolares"]);
  }
}
