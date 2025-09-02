import { Component, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { TableModule } from "primeng/table";
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { TagModule } from "primeng/tag";
import { TooltipModule } from "primeng/tooltip";
import { Select } from "primeng/select";
import { PaginatorModule } from "primeng/paginator";
import { usePago } from "../../hooks/use-pago.hook";
import * as XLSX from "xlsx";

@Component({
  selector: "app-pagos",
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    TooltipModule,
    Select,
    PaginatorModule,
  ],
  templateUrl: "./pagos.html",
  styleUrl: "./pagos.css",
})
export class Pagos implements OnInit {
  pagoService = inject(usePago);

  // Filtros y búsqueda
  selectedNivel: string = "";
  selectedGrado: string = "";
  selectedModalidad: string = "";
  searchTerm: string = "";

  // Paginación
  first: number = 0;
  rows: number = 5;

  // Control del acordeón
  expandedStudents: Set<number> = new Set();

  // Opciones de filtros
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
    this.pagoService.loadEstudiantesConPagos();
  }

  estudiantesConPagos = this.pagoService.estudiantesConPagos;
  loading = this.pagoService.loading;
  error = this.pagoService.error;

  get filteredEstudiantesConPagos() {
    let filtered = this.estudiantesConPagos();

    // Filtrar por nivel si está seleccionado
    if (this.selectedNivel) {
      filtered = filtered.filter(
        (estudiante) => estudiante.nivel.toLowerCase() === this.selectedNivel.toLowerCase()
      );
    }

    // Filtrar por grado si está seleccionado
    if (this.selectedGrado) {
      filtered = filtered.filter(
        (estudiante) => estudiante.grado.toString() === this.selectedGrado
      );
    }

    // Filtrar por modalidad si está seleccionada
    if (this.selectedModalidad) {
      filtered = filtered.filter(
        (estudiante) => estudiante.modalidad.toLowerCase() === this.selectedModalidad.toLowerCase()
      );
    }

    // Filtrar por término de búsqueda
    if (this.searchTerm.trim()) {
      filtered = filtered.filter(
        (estudiante) =>
          estudiante.nombreCompleto
            .toLowerCase()
            .includes(this.searchTerm.toLowerCase()) ||
          estudiante.pagos.some(pago => 
            pago.folio
              .toLowerCase()
              .includes(this.searchTerm.toLowerCase()) ||
            pago.conceptos.some(concepto => 
              concepto
                .toLowerCase()
                .includes(this.searchTerm.toLowerCase())
            )
          )
      );
    }

    return filtered;
  }

  get paginatedStudents() {
    const students = this.filteredEstudiantesConPagos;
    const start = this.first;
    const end = this.first + this.rows;
    return students.slice(start, end);
  }

  getTotalPagos(): number {
    return this.filteredEstudiantesConPagos.reduce((total, estudiante) => total + estudiante.totalPagos, 0);
  }

  getMontoTotal(): number {
    return this.filteredEstudiantesConPagos.reduce((total, estudiante) => total + estudiante.montoTotalPagado, 0);
  }

  toggleStudent(studentId: number) {
    if (this.expandedStudents.has(studentId)) {
      this.expandedStudents.delete(studentId);
    } else {
      this.expandedStudents.add(studentId);
    }
  }

  isStudentExpanded(studentId: number): boolean {
    return this.expandedStudents.has(studentId);
  }

  onPageChange(event: any) {
    this.first = event.first;
    this.rows = event.rows;
  }

  onSearch(event: any) {
    this.searchTerm = event.target.value;
    this.resetPagination();
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
    this.selectedGrado = "";
    this.resetPagination();
  }

  onGradoChange() {
    this.resetPagination();
  }

  onModalidadChange() {
    this.resetPagination();
  }

  resetPagination() {
    this.first = 0;
  }

  exportToExcel() {
    const estudiantesData = this.filteredEstudiantesConPagos.map((estudiante) => ({
      Estudiante: estudiante.nombreCompleto,
      Nivel: estudiante.nivel,
      Grado: `${estudiante.grado}°`,
      Modalidad: estudiante.modalidad,
      "Total Pagos": estudiante.totalPagos,
      "Monto Total": estudiante.montoTotalPagado,
      "Fecha Último Pago": estudiante.fechaUltimoPago 
        ? estudiante.fechaUltimoPago.toLocaleDateString()
        : "Sin pagos",
    }));

    const pagosData: any[] = [];
    this.filteredEstudiantesConPagos.forEach((estudiante) => {
      estudiante.pagos.forEach((pago) => {
        pagosData.push({
          Estudiante: estudiante.nombreCompleto,
          Nivel: estudiante.nivel,
          Grado: `${estudiante.grado}°`,
          Modalidad: estudiante.modalidad,
          Folio: pago.folio,
          Monto: pago.monto,
          Método: pago.metodoPago,
          Fecha: pago.fecha.toLocaleDateString(),
          "Conceptos Adeudos": pago.adeudos.map((a: any) => a.nombre).join(", "),
          "Conceptos Requeridos": pago.requeridos.map((r: any) => r.nombre).join(", "),
        });
      });
    });

    const workbook = XLSX.utils.book_new();
    
    const estudiantesSheet = XLSX.utils.json_to_sheet(estudiantesData);
    XLSX.utils.book_append_sheet(workbook, estudiantesSheet, "Resumen Estudiantes");
    
    const pagosSheet = XLSX.utils.json_to_sheet(pagosData);
    XLSX.utils.book_append_sheet(workbook, pagosSheet, "Detalle Pagos");

    XLSX.writeFile(workbook, "estudiantes_pagos.xlsx");
  }

  exportStudentToExcel(estudiante: any) {
    const studentName = estudiante.nombreCompleto;
    
    const pagosSheet = XLSX.utils.json_to_sheet(
      estudiante.pagos.map((pago: any) => ({
        Folio: pago.folio,
        "Método de Pago": pago.metodoPago === 'efectivo' ? 'Efectivo' : 'Transferencia',
        Monto: pago.monto,
        "Fecha de Pago": pago.fecha.toLocaleDateString(),
        "Conceptos Adeudos": pago.adeudos.map((a: any) => a.nombre).join(", "),
        "Conceptos Requeridos": pago.requeridos.map((r: any) => r.nombre).join(", "),
      }))
    );

    // Agregar información del estudiante al final
    const studentInfo = [
      [],
      ["Resumen del Estudiante"],
      ["Nombre:", studentName],
      ["Nivel:", estudiante.nivel],
      ["Grado:", `${estudiante.grado}°`],
      ["Modalidad:", estudiante.modalidad],
      ["Último Pago:", estudiante.fechaUltimoPago ? estudiante.fechaUltimoPago.toLocaleDateString() : "Sin pagos registrados"],
      [],
      ["Total de Pagos:", estudiante.totalPagos],
      ["Monto Total Pagado:", `$${estudiante.montoTotalPagado.toFixed(2)}`],
    ];

    // Agregar las filas de información del estudiante
    const ws = pagosSheet;
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    let startRow = range.e.r + 2;

    studentInfo.forEach((row, index) => {
      row.forEach((cell, colIndex) => {
        const cellAddress = XLSX.utils.encode_cell({ r: startRow + index, c: colIndex });
        ws[cellAddress] = { v: cell, t: typeof cell === 'number' ? 'n' : 's' };
      });
    });

    // Actualizar el rango
    ws['!ref'] = XLSX.utils.encode_range({
      s: { r: 0, c: 0 },
      e: { r: startRow + studentInfo.length - 1, c: Math.max(range.e.c, 1) }
    });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, pagosSheet, "Pagos");
    
    const fileName = `pagos_${studentName.replace(/\s+/g, '_')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  }
}
