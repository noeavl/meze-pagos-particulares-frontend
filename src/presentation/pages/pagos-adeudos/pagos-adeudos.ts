import { Component, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { TableModule } from "primeng/table";
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { TagModule } from "primeng/tag";
import { TooltipModule } from "primeng/tooltip";
import { Select } from "primeng/select";
import { usePago } from "../../hooks/use-pago.hook";
import * as XLSX from "xlsx";

@Component({
  selector: "app-pagos-adeudos",
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    TooltipModule,
    Select,
  ],
  templateUrl: "./pagos-adeudos.html",
  styleUrl: "./pagos-adeudos.css",
})
export class PagosAdeudos implements OnInit {
  pagoService = inject(usePago);

  // Filtros y búsqueda
  selectedEstado: string = "";
  selectedNivel: string = "";
  selectedGrado: string = "";
  selectedModalidad: string = "";
  searchTerm: string = "";

  // Opciones de filtros
  estadoOptions = [
    { label: "Todos los estados", value: "" },
    { label: "Pendiente", value: "pendiente" },
    { label: "Pagado", value: "pagado" },
    { label: "Vencido", value: "vencido" },
  ];

  nivelOptions = [
    { label: "Todos los niveles", value: "" },
    { label: "Preescolar", value: "preescolar" },
    { label: "Primaria", value: "primaria" },
    { label: "Secundaria", value: "secundaria" },
    { label: "Bachillerato", value: "bachillerato" },
    { label: "Bachillerato Sabatino", value: "bachillerato_sabatino" },
  ];

  modalidadOptions = [
    { label: "Todas las modalidades", value: "" },
    { label: "Presencial", value: "presencial" },
    { label: "En Línea", value: "en_linea" },
  ];

  gradosPorNivel = {
    preescolar: [1, 2, 3],
    primaria: [1, 2, 3, 4, 5, 6],
    secundaria: [1, 2, 3],
    bachillerato: [1, 2, 3, 4, 5, 6],
    bachillerato_sabatino: [1, 2, 3, 4, 5, 6],
  };

  constructor() {}

  ngOnInit() {
    this.pagoService.loadPagosAdeudos();
  }

  pagosAdeudos = this.pagoService.pagosAdeudos;
  loading = this.pagoService.loading;
  error = this.pagoService.error;

  get filteredPagosAdeudos() {
    let filtered = this.pagosAdeudos();

    // Filtrar por estado si está seleccionado
    if (this.selectedEstado) {
      filtered = filtered.filter(
        (pagoAdeudo) => pagoAdeudo.estadoAdeudo.toLowerCase() === this.selectedEstado.toLowerCase()
      );
    }

    // Filtrar por nivel si está seleccionado
    if (this.selectedNivel) {
      filtered = filtered.filter(
        (pagoAdeudo) => pagoAdeudo.nivel === this.selectedNivel
      );
    }

    // Filtrar por grado si está seleccionado
    if (this.selectedGrado) {
      filtered = filtered.filter(
        (pagoAdeudo) => pagoAdeudo.grado.toString() === this.selectedGrado
      );
    }

    // Filtrar por modalidad si está seleccionada
    if (this.selectedModalidad) {
      filtered = filtered.filter(
        (pagoAdeudo) => pagoAdeudo.modalidad === this.selectedModalidad
      );
    }

    // Filtrar por término de búsqueda
    if (this.searchTerm.trim()) {
      filtered = filtered.filter(
        (pagoAdeudo) =>
          pagoAdeudo.folio
            .toLowerCase()
            .includes(this.searchTerm.toLowerCase()) ||
          pagoAdeudo.metodoPago
            .toLowerCase()
            .includes(this.searchTerm.toLowerCase()) ||
          pagoAdeudo.nombreCompleto
            .toLowerCase()
            .includes(this.searchTerm.toLowerCase()) ||
          pagoAdeudo.concepto
            .toLowerCase()
            .includes(this.searchTerm.toLowerCase())
      );
    }

    return filtered;
  }

  onSearch(event: any) {
    this.searchTerm = event.target.value;
  }

  onEstadoChange() {
    // No necesita lógica adicional, el getter se actualizará automáticamente
  }

  get availableGradoOptions(): number[] {
    if (!this.selectedNivel) {
      return [];
    }
    return (
      this.gradosPorNivel[
        this.selectedNivel as keyof typeof this.gradosPorNivel
      ] || []
    );
  }

  get gradoOptionsForSelect() {
    const options = [{ label: "Todos los grados", value: "" }];
    const gradoOptions = this.availableGradoOptions.map((grado) => ({
      label: `${grado}°`,
      value: grado.toString(),
    }));
    return [...options, ...gradoOptions];
  }

  onNivelChange() {
    // Reset grado selection when nivel changes
    this.selectedGrado = "";
  }

  onGradoChange() {
    // No necesita lógica adicional
  }

  onModalidadChange() {
    // No necesita lógica adicional
  }

  exportToExcel() {
    const pagosAdeudosSheet = XLSX.utils.json_to_sheet(
      this.filteredPagosAdeudos.map((p) => ({
        Folio: p.folio,
        Estudiante: p.nombreCompleto,
        Concepto: p.concepto,
        Metodo: p.metodoPago,
        Monto: p.monto,
        Total: p.montoTotal,
        "Fecha pago": new Date(p.fecha).toLocaleDateString(),
        Vencimiento: new Date(p.fechaVencimiento).toLocaleDateString(),
      }))
    );

    const pagosAdeudosBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      pagosAdeudosBook,
      pagosAdeudosSheet,
      "Pagos de adeudos"
    );

    XLSX.writeFile(pagosAdeudosBook, "pagos_adeudos.xlsx");
  }
}
