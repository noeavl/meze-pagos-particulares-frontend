import { Component, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { TableModule } from "primeng/table";
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { InputGroupModule } from "primeng/inputgroup";
import { InputGroupAddonModule } from "primeng/inputgroupaddon";
import { TagModule } from "primeng/tag";
import { TooltipModule } from "primeng/tooltip";
import { Select } from "primeng/select";
import { PaginatorModule } from "primeng/paginator";
import { useAdeudo } from "../../hooks/use-adeudo.hook";
import { RouterLink } from "@angular/router";
import * as XLSX from "xlsx";
import { Popover } from "primeng/popover";

@Component({
  selector: "app-adeudos",
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    InputGroupModule,
    InputGroupAddonModule,
    TagModule,
    Select,
    PaginatorModule,
    RouterLink,
    Popover,
  ],
  templateUrl: "./adeudos.html",
  styleUrl: "./adeudos.css",
})
export class Adeudos implements OnInit {
  adeudoService = inject(useAdeudo);

  // Filtros y búsqueda
  selectedEstado: string = "";
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
    this.adeudoService.loadAdeudos();
  }

  get adeudos() {
    return this.adeudoService.adeudos();
  }

  get loading() {
    return this.adeudoService.loading();
  }

  get error() {
    return this.adeudoService.error();
  }

  get groupedStudents() {
    // Obtener datos del servicio que ya viene agrupado por estudiante
    const students = this.adeudoService.estudiantesConAdeudos();

    // Aplicar filtros
    let filtered = students;

    // Filtrar por nivel si está seleccionado
    if (this.selectedNivel) {
      filtered = filtered.filter(
        (student) => student.nivel === this.selectedNivel
      );
    }

    // Filtrar por grado si está seleccionado
    if (this.selectedGrado) {
      filtered = filtered.filter(
        (student) => student.grado.toString() === this.selectedGrado
      );
    }

    // Filtrar por modalidad si está seleccionada
    if (this.selectedModalidad) {
      filtered = filtered.filter(
        (student) => student.modalidad === this.selectedModalidad
      );
    }

    // Filtrar por estado de adeudos si está seleccionado
    if (this.selectedEstado) {
      filtered = filtered
        .map((student: any) => ({
          ...student,
          adeudos: student.adeudos.filter(
            (adeudo: any) =>
              adeudo.estado.toLowerCase() === this.selectedEstado.toLowerCase()
          ),
        }))
        .filter((student: any) => student.adeudos.length > 0);
    }

    // Filtrar por término de búsqueda (nombre completo del estudiante y CURP)
    if (this.searchTerm) {
      const searchTerms = this.searchTerm.toLowerCase().trim().split(/\s+/);
      filtered = filtered.filter((student: any) => {
        const fullName = this.normalizeText(
          `${student.persona.nombres} ${student.persona.apellido_paterno} ${student.persona.apellido_materno}`
        );
        const curp = this.normalizeText(student.curp || "");

        return searchTerms.every((term) => {
          const normalizedTerm = this.normalizeText(term);
          const grupo = this.normalizeText(student.grupo || "");
          return (
            fullName.includes(normalizedTerm) || 
            curp.includes(normalizedTerm) || 
            grupo.includes(normalizedTerm)
          );
        });
      });
    }

    return filtered;
  }

  get filteredAdeudos() {
    const allAdeudos = this.groupedStudents.flatMap((student: any) =>
      student.adeudos.map((adeudo: any) => ({
        ...adeudo,
        estudiante: {
          nombres: student.persona.nombres,
          apellidoPaterno: student.persona.apellido_paterno,
          apellidoMaterno: student.persona.apellido_materno,
          nivel: { rawValue: student.nivel, displayValue: student.nivel },
          grado: student.grado,
          modalidad: {
            rawValue: student.modalidad,
            displayValue: student.modalidad,
          },
        },
        montoTotal: parseFloat(adeudo.total),
        montoPagado: parseFloat(adeudo.pagado),
        montoPendiente: parseFloat(adeudo.pendiente),
        fechaVencimiento: adeudo.fecha_vencimiento,
        estado: {
          displayValue: adeudo.estado,
          colorClass:
            adeudo.estado === "pendiente"
              ? "bg-yellow-100 text-yellow-800"
              : adeudo.estado === "pagado"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800",
        },
      }))
    );

    return allAdeudos;
  }

  get totalConceptos() {
    return this.filteredAdeudos.reduce(
      (sum, adeudo) => sum + adeudo.montoTotal,
      0
    );
  }

  get totalPagado() {
    return this.filteredAdeudos.reduce(
      (sum, adeudo) => sum + adeudo.montoPagado,
      0
    );
  }

  get totalPendiente() {
    return this.filteredAdeudos.reduce(
      (sum, adeudo) => sum + adeudo.montoPendiente,
      0
    );
  }

  onSearch(event: any) {
    this.searchTerm = event.target.value;
    this.resetPagination();
  }

  onEstadoChange() {
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
    // Reset grado selection when nivel changes
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

  getStudentTotalPendiente(adeudos: any[]) {
    return adeudos.reduce(
      (sum, adeudo) => sum + parseFloat(adeudo.pendiente),
      0
    );
  }

  getStudentTotal(adeudos: any[]) {
    return adeudos.reduce((sum, adeudo) => sum + parseFloat(adeudo.total), 0);
  }

  getStudentTotalPagado(adeudos: any[]) {
    return adeudos.reduce((sum, adeudo) => sum + parseFloat(adeudo.pagado), 0);
  }

  get paginatedStudents() {
    const students = this.groupedStudents;
    const start = this.first;
    const end = this.first + this.rows;
    return students.slice(start, end);
  }

  get totalStudents() {
    return this.groupedStudents.length;
  }

  onPageChange(event: any) {
    this.first = event.first;
    this.rows = event.rows;
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

  exportToExcel() {
    const studentsSheet = XLSX.utils.json_to_sheet(
      this.groupedStudents.map((student) => ({
        Estudiante: `${student.persona.nombres} ${student.persona.apellido_paterno} ${student.persona.apellido_materno}`,
        Nivel: this.formatNivel(student.nivel),
        Grado: `${student.grado}°`,
        Modalidad: this.formatModalidad(student.modalidad),
        "Último Pago": student.ultimo_pago_fecha
          ? new Date(student.ultimo_pago_fecha).toLocaleDateString()
          : "Sin pagos registrados",
        "Total General": this.getStudentTotal(student.adeudos),
        "Total Pagado": this.getStudentTotalPagado(student.adeudos),
        "Total Pendiente": this.getStudentTotalPendiente(student.adeudos),
        "Número de Adeudos": student.adeudos.length,
      }))
    );

    // Agregar totales generales al final
    const totalInfo = [
      [],
      ["TOTALES GENERALES"],
      ["Total de Estudiantes:", this.groupedStudents.length],
      ["Total General:", `$${this.totalConceptos.toFixed(2)}`],
      ["Total Pagado:", `$${this.totalPagado.toFixed(2)}`],
      ["Total Pendiente:", `$${this.totalPendiente.toFixed(2)}`],
    ];

    // Obtener el rango actual de la hoja
    const ws = studentsSheet;
    const range = XLSX.utils.decode_range(ws["!ref"] || "A1");
    let startRow = range.e.r + 2;

    // Agregar las filas de totales
    totalInfo.forEach((row, index) => {
      row.forEach((cell, colIndex) => {
        const cellAddress = XLSX.utils.encode_cell({
          r: startRow + index,
          c: colIndex,
        });
        ws[cellAddress] = { v: cell, t: typeof cell === "number" ? "n" : "s" };
      });
    });

    // Actualizar el rango de la hoja
    ws["!ref"] = XLSX.utils.encode_range({
      s: { r: 0, c: 0 },
      e: { r: startRow + totalInfo.length - 1, c: Math.max(range.e.c, 1) },
    });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      studentsSheet,
      "Resumen Estudiantes"
    );
    XLSX.writeFile(workbook, "resumen_adeudos_estudiantes.xlsx");
  }

  exportStudentToExcel(student: any) {
    const studentName = `${student.persona.nombres} ${student.persona.apellido_paterno} ${student.persona.apellido_materno}`;

    const adeudosSheet = XLSX.utils.json_to_sheet(
      student.adeudos.map((adeudo: any) => ({
        Concepto: adeudo.concepto.nombre,
        Periodo: this.formatPeriodo(adeudo.concepto.periodo),
        "Descripción Período": adeudo.descripcion_periodo || "Sin descripción",
        "Monto Total": parseFloat(adeudo.total),
        "Monto Pagado": parseFloat(adeudo.pagado),
        "Monto Pendiente": parseFloat(adeudo.pendiente),
        Estado: adeudo.estado,
        "Fecha Inicio": new Date(adeudo.fecha_inicio).toLocaleDateString(),
        "Fecha Vencimiento": new Date(
          adeudo.fecha_vencimiento
        ).toLocaleDateString(),
      }))
    );

    // Agregar información del estudiante al final
    const studentInfo = [
      [],
      ["Resumen del Estudiante"],
      ["Nombre:", studentName],
      ["Nivel:", this.formatNivel(student.nivel)],
      ["Grado:", `${student.grado}°`],
      ["Modalidad:", this.formatModalidad(student.modalidad)],
      [
        "Último Pago:",
        student.ultimo_pago_fecha
          ? new Date(student.ultimo_pago_fecha).toLocaleDateString()
          : "Sin pagos registrados",
      ],
      [],
      [
        "Total General:",
        `$${this.getStudentTotal(student.adeudos).toFixed(2)}`,
      ],
      [
        "Total Pagado:",
        `$${this.getStudentTotalPagado(student.adeudos).toFixed(2)}`,
      ],
      [
        "Total Pendiente:",
        `$${this.getStudentTotalPendiente(student.adeudos).toFixed(2)}`,
      ],
    ];

    // Agregar las filas de información del estudiante
    const ws = adeudosSheet;
    const range = XLSX.utils.decode_range(ws["!ref"] || "A1");
    let startRow = range.e.r + 2;

    studentInfo.forEach((row, index) => {
      row.forEach((cell, colIndex) => {
        const cellAddress = XLSX.utils.encode_cell({
          r: startRow + index,
          c: colIndex,
        });
        ws[cellAddress] = { v: cell, t: typeof cell === "number" ? "n" : "s" };
      });
    });

    // Actualizar el rango
    ws["!ref"] = XLSX.utils.encode_range({
      s: { r: 0, c: 0 },
      e: { r: startRow + studentInfo.length - 1, c: Math.max(range.e.c, 1) },
    });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, adeudosSheet, "Adeudos");

    const fileName = `adeudos_${studentName.replace(/\s+/g, "_")}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  }

  formatNivel(nivel: string): string {
    const niveles: Record<string, string> = {
      preescolar: "Preescolar",
      primaria: "Primaria",
      secundaria: "Secundaria",
      bachillerato: "Bachillerato",
      bachillerato_sabatino: "Bachillerato Sabatino",
    };
    return niveles[nivel] || nivel;
  }

  formatModalidad(modalidad: string): string {
    const modalidades: Record<string, string> = {
      presencial: "Presencial",
      en_linea: "En Línea",
    };
    return modalidades[modalidad] || modalidad;
  }

  formatPeriodo(periodo: string): string {
    const periodos: Record<string, string> = {
      pago_unico: "Pago Único",
      mensual: "Mensual",
      semestral: "Semestral",
    };
    return periodos[periodo] || periodo;
  }

  normalizeText(text: string): string {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, ""); // Eliminar acentos
  }
}
