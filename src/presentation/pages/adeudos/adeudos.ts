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
import { useNivel } from "../../hooks/use-nivel.hook";
import { useModalidad } from "../../hooks/use-modalidad.hook";
import { useGrado } from "../../hooks/use-grado.hook";
import { RouterLink } from "@angular/router";
import * as XLSX from "xlsx";
import * as ExcelJS from 'exceljs';
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
  nivelService = inject(useNivel);
  modalidadService = inject(useModalidad);
  gradoService = inject(useGrado);

  // Filtros y búsqueda
  selectedEstado: string = "";
  selectedNivel: string = "general";
  selectedGrado: string = "general";
  selectedModalidad: string = "general";
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

  get nivelOptions() {
    return this.nivelService.getNivelesOptions();
  }

  get modalidadOptions() {
    return this.modalidadService.getModalidadesOptions();
  }

  get gradoOptions() {
    return this.gradoService.getGradosOptionsForSelect();
  }


  constructor() {}

  ngOnInit() {
    this.adeudoService.loadAdeudos();
    this.nivelService.loadNiveles();
    this.modalidadService.loadModalidades();
    this.gradoService.loadGradosByNivel('general');
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

    // Filtrar por nivel si está seleccionado y no es "general"
    if (this.selectedNivel && this.selectedNivel !== "general") {
      filtered = filtered.filter(
        (student) => student.nivel_grado?.nivel?.nombre === this.selectedNivel
      );
    }

    // Filtrar por grado si está seleccionado y no es "general"
    if (this.selectedGrado && this.selectedGrado !== "general") {
      filtered = filtered.filter(
        (student) => student.nivel_grado?.grado?.numero === this.selectedGrado
      );
    }

    // Filtrar por modalidad si está seleccionada y no es "general"
    if (this.selectedModalidad && this.selectedModalidad !== "general") {
      filtered = filtered.filter(
        (student) => student.nivel_grado?.modalidad?.nombre === this.selectedModalidad
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
          nivel: { 
            rawValue: student.nivel_grado?.nivel?.nombre || '', 
            displayValue: student.nivel_grado?.nivel?.nombre || '' 
          },
          grado: student.nivel_grado?.grado?.numero || 'N/A',
          modalidad: {
            rawValue: student.nivel_grado?.modalidad?.nombre || '',
            displayValue: student.nivel_grado?.modalidad?.nombre || '',
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

  onNivelChange() {
    if (this.selectedNivel === 'general') {
      this.selectedGrado = "general";
    } else {
      this.selectedGrado = "general";
      this.gradoService.loadGradosByNivel(this.selectedNivel);
    }
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

  async exportToExcel() {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Resumen Estudiantes');

    // Definir las columnas
    worksheet.columns = [
      { header: 'Estudiante', key: 'estudiante', width: 25 },
      { header: 'Nivel', key: 'nivel', width: 12 },
      { header: 'Grado', key: 'grado', width: 8 },
      { header: 'Modalidad', key: 'modalidad', width: 12 },
      { header: 'Último Pago', key: 'ultimoPago', width: 15 },
      { header: 'Total General', key: 'totalGeneral', width: 15 },
      { header: 'Total Pagado', key: 'totalPagado', width: 15 },
      { header: 'Total Pendiente', key: 'totalPendiente', width: 15 },
      { header: 'Número de Adeudos', key: 'numeroAdeudos', width: 12 }
    ];

    // Aplicar estilos a los encabezados
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell, colNumber) => {
      let headerColor = '4472C4'; // Azul por defecto
      
      if (colNumber === 6) headerColor = '2E5BBA'; // Total General - Azul oscuro
      else if (colNumber === 7) headerColor = '70AD47'; // Total Pagado - Verde
      else if (colNumber === 8) headerColor = 'C55A5A'; // Total Pendiente - Rojo
      
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF' + headerColor }
      };
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    // Agregar datos de estudiantes
    this.groupedStudents.forEach((student, index) => {
      const rowNumber = index + 2;
      const row = worksheet.addRow({
        estudiante: `${student.persona.nombres} ${student.persona.apellido_paterno} ${student.persona.apellido_materno}`,
        nivel: this.formatNivel(student.nivel_grado?.nivel?.nombre || ''),
        grado: `${student.nivel_grado?.grado?.numero || 'N/A'}°`,
        modalidad: this.formatModalidad(student.nivel_grado?.modalidad?.nombre || ''),
        ultimoPago: student.ultimo_pago_fecha
          ? new Date(student.ultimo_pago_fecha).toLocaleDateString()
          : "Sin pagos registrados",
        totalGeneral: this.getStudentTotal(student.adeudos),
        totalPagado: this.getStudentTotalPagado(student.adeudos),
        totalPendiente: this.getStudentTotalPendiente(student.adeudos),
        numeroAdeudos: student.adeudos.length,
      });

      const isEvenRow = index % 2 === 0;

      // Aplicar estilos a cada celda
      row.eachCell((cell, colNumber) => {
        let cellColor = isEvenRow ? 'F2F2F2' : 'FFFFFF';
        
        // Colores especiales para columnas de montos
        if (colNumber === 6) { // Total General - Azul
          cellColor = isEvenRow ? 'E7F3FF' : 'F0F8FF';
          cell.numFmt = '"$"#,##0.00';
        } else if (colNumber === 7) { // Total Pagado - Verde
          cellColor = isEvenRow ? 'E8F5E8' : 'F0FFF0';
          cell.numFmt = '"$"#,##0.00';
        } else if (colNumber === 8) { // Total Pendiente - Rojo
          cellColor = isEvenRow ? 'FFE8E8' : 'FFF0F0';
          cell.numFmt = '"$"#,##0.00';
        }

        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF' + cellColor }
        };
        
        cell.alignment = { 
          horizontal: (colNumber >= 6 && colNumber <= 8) ? 'right' : 'left',
          vertical: 'middle' 
        };
        
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFD0D0D0' } },
          left: { style: 'thin', color: { argb: 'FFD0D0D0' } },
          bottom: { style: 'thin', color: { argb: 'FFD0D0D0' } },
          right: { style: 'thin', color: { argb: 'FFD0D0D0' } }
        };
      });
    });

    // Agregar línea vacía y totales
    const emptyRow = worksheet.addRow([]);
    const totalTitleRow = worksheet.addRow(['TOTALES GENERALES']);
    
    // Estilo para el título de totales
    totalTitleRow.getCell(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF70AD47' }
    };
    totalTitleRow.getCell(1).font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 14 };
    totalTitleRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    
    // Agregar filas de totales
    const totalsData = [
      ['Total de Estudiantes:', this.groupedStudents.length],
      ['Total General:', this.totalConceptos],
      ['Total Pagado:', this.totalPagado],
      ['Total Pendiente:', this.totalPendiente],
    ];

    totalsData.forEach(([label, value]) => {
      const row = worksheet.addRow([label, value]);
      row.getCell(1).font = { bold: true };
      row.getCell(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE2EFDA' }
      };
      row.getCell(2).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF2F2F2' }
      };
      
      if (typeof value === 'number' && label !== 'Total de Estudiantes:') {
        row.getCell(2).numFmt = '"$"#,##0.00';
      }
      
      row.getCell(2).alignment = { horizontal: 'right', vertical: 'middle' };
    });

    // Guardar archivo
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'resumen_adeudos_estudiantes.xlsx';
    link.click();
    window.URL.revokeObjectURL(url);
  }

  async exportStudentToExcel(student: any) {
    const studentName = `${student.persona.nombres} ${student.persona.apellido_paterno} ${student.persona.apellido_materno}`;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Adeudos');

    // Definir las columnas
    worksheet.columns = [
      { header: 'Concepto', key: 'concepto', width: 20 },
      { header: 'Periodo', key: 'periodo', width: 15 },
      { header: 'Descripción Período', key: 'descripcionPeriodo', width: 20 },
      { header: 'Monto Total', key: 'montoTotal', width: 15 },
      { header: 'Monto Pagado', key: 'montoPagado', width: 15 },
      { header: 'Monto Pendiente', key: 'montoPendiente', width: 15 },
      { header: 'Estado', key: 'estado', width: 12 },
      { header: 'Fecha Inicio', key: 'fechaInicio', width: 15 },
      { header: 'Fecha Vencimiento', key: 'fechaVencimiento', width: 15 }
    ];

    // Aplicar estilos a los encabezados
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell, colNumber) => {
      let headerColor = '4472C4'; // Azul por defecto
      
      if (colNumber === 4) headerColor = '2E5BBA'; // Monto Total - Azul oscuro
      else if (colNumber === 5) headerColor = '70AD47'; // Monto Pagado - Verde
      else if (colNumber === 6) headerColor = 'C55A5A'; // Monto Pendiente - Rojo
      
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF' + headerColor }
      };
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    // Agregar datos de adeudos
    student.adeudos.forEach((adeudo: any, index: number) => {
      const row = worksheet.addRow({
        concepto: adeudo.concepto.nombre,
        periodo: this.formatPeriodo(adeudo.concepto.periodo),
        descripcionPeriodo: adeudo.descripcion_periodo || "Sin descripción",
        montoTotal: parseFloat(adeudo.total),
        montoPagado: parseFloat(adeudo.pagado),
        montoPendiente: parseFloat(adeudo.pendiente),
        estado: adeudo.estado,
        fechaInicio: new Date(adeudo.fecha_inicio).toLocaleDateString(),
        fechaVencimiento: new Date(adeudo.fecha_vencimiento).toLocaleDateString()
      });

      const isEvenRow = index % 2 === 0;

      // Aplicar estilos a cada celda
      row.eachCell((cell, colNumber) => {
        let cellColor = isEvenRow ? 'F2F2F2' : 'FFFFFF';
        
        // Colores especiales para columnas de montos
        if (colNumber === 4) { // Monto Total - Azul
          cellColor = isEvenRow ? 'E7F3FF' : 'F0F8FF';
          cell.numFmt = '"$"#,##0.00';
        } else if (colNumber === 5) { // Monto Pagado - Verde
          cellColor = isEvenRow ? 'E8F5E8' : 'F0FFF0';
          cell.numFmt = '"$"#,##0.00';
        } else if (colNumber === 6) { // Monto Pendiente - Rojo
          cellColor = isEvenRow ? 'FFE8E8' : 'FFF0F0';
          cell.numFmt = '"$"#,##0.00';
        }

        // Color especial para estado
        if (colNumber === 7) { // Estado
          if (cell.value === 'pagado') {
            cellColor = isEvenRow ? 'E8F5E8' : 'F0FFF0'; // Verde para pagado
          } else if (cell.value === 'pendiente') {
            cellColor = isEvenRow ? 'FFE8E8' : 'FFF0F0'; // Rojo para pendiente
          }
        }

        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF' + cellColor }
        };
        
        cell.alignment = { 
          horizontal: (colNumber >= 4 && colNumber <= 6) ? 'right' : 'left',
          vertical: 'middle' 
        };
        
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFD0D0D0' } },
          left: { style: 'thin', color: { argb: 'FFD0D0D0' } },
          bottom: { style: 'thin', color: { argb: 'FFD0D0D0' } },
          right: { style: 'thin', color: { argb: 'FFD0D0D0' } }
        };
      });
    });

    // Agregar información del estudiante
    const emptyRow = worksheet.addRow([]);
    const studentTitleRow = worksheet.addRow(['RESUMEN DEL ESTUDIANTE']);
    
    // Estilo para el título
    studentTitleRow.getCell(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };
    studentTitleRow.getCell(1).font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 14 };
    studentTitleRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };

    // Agregar datos del estudiante
    const studentData = [
      ['Nombre:', studentName],
      ['Nivel:', this.formatNivel(student.nivel_grado?.nivel?.nombre || '')],
      ['Grado:', `${student.nivel_grado?.grado?.numero || 'N/A'}°`],
      ['Modalidad:', this.formatModalidad(student.nivel_grado?.modalidad?.nombre || '')],
      ['Último Pago:', student.ultimo_pago_fecha 
        ? new Date(student.ultimo_pago_fecha).toLocaleDateString() 
        : "Sin pagos registrados"],
      [], // Línea vacía
      ['Total General:', this.getStudentTotal(student.adeudos)],
      ['Total Pagado:', this.getStudentTotalPagado(student.adeudos)],
      ['Total Pendiente:', this.getStudentTotalPendiente(student.adeudos)],
    ];

    studentData.forEach(([label, value], index) => {
      const row = worksheet.addRow([label, value]);
      
      if (label && value !== undefined) {
        row.getCell(1).font = { bold: true };
        row.getCell(1).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE2F3FF' }
        };
        
        // Colores especiales para los totales
        if (label.includes('Total General')) {
          row.getCell(2).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE7F3FF' }
          };
          row.getCell(2).numFmt = '"$"#,##0.00';
        } else if (label.includes('Total Pagado')) {
          row.getCell(2).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE8F5E8' }
          };
          row.getCell(2).numFmt = '"$"#,##0.00';
        } else if (label.includes('Total Pendiente')) {
          row.getCell(2).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFE8E8' }
          };
          row.getCell(2).numFmt = '"$"#,##0.00';
        } else {
          row.getCell(2).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF2F2F2' }
          };
        }
        
        row.getCell(2).alignment = { horizontal: 'right', vertical: 'middle' };
      }
    });

    // Guardar archivo
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const fileName = `adeudos_${studentName.replace(/\s+/g, "_")}.xlsx`;
    link.download = fileName;
    link.click();
    window.URL.revokeObjectURL(url);
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
