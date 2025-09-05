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
import { Popover } from "primeng/popover";
import { PaginatorModule } from "primeng/paginator";
import { RouterLink } from "@angular/router";
import { usePago } from "../../hooks/use-pago.hook";
import { useNivel } from "../../hooks/use-nivel.hook";
import { useModalidad } from "../../hooks/use-modalidad.hook";
import { useGrado } from "../../hooks/use-grado.hook";
import * as XLSX from "xlsx";
import * as ExcelJS from 'exceljs';

@Component({
  selector: "app-pagos",
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    InputGroupModule,
    InputGroupAddonModule,
    TagModule,
    TooltipModule,
    Select,
    Popover,
    PaginatorModule,
    RouterLink,
  ],
  templateUrl: "./pagos.html",
  styleUrl: "./pagos.css",
})
export class Pagos implements OnInit {
  pagoService = inject(usePago);
  nivelService = inject(useNivel);
  modalidadService = inject(useModalidad);
  gradoService = inject(useGrado);

  // Filtros y búsqueda
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
    this.pagoService.loadEstudiantesConPagos();
    this.nivelService.loadNiveles();
    this.modalidadService.loadModalidades();
    this.gradoService.loadGradosByNivel('general');
  }

  estudiantesConPagos = this.pagoService.estudiantesConPagos;
  loading = this.pagoService.loading;
  error = this.pagoService.error;

  get filteredEstudiantesConPagos() {
    let filtered = this.estudiantesConPagos();

    // Filtrar por nivel si está seleccionado y no es "general"
    if (this.selectedNivel && this.selectedNivel !== "general") {
      filtered = filtered.filter(
        (estudiante) => estudiante.nivel.toLowerCase() === this.selectedNivel.toLowerCase()
      );
    }

    // Filtrar por grado si está seleccionado y no es "general"
    if (this.selectedGrado && this.selectedGrado !== "general") {
      filtered = filtered.filter(
        (estudiante) => estudiante.grado.toString() === this.selectedGrado
      );
    }

    // Filtrar por modalidad si está seleccionada y no es "general"
    if (this.selectedModalidad && this.selectedModalidad !== "general") {
      filtered = filtered.filter(
        (estudiante) => estudiante.modalidad.toLowerCase() === this.selectedModalidad.toLowerCase()
      );
    }

    // Filtrar por término de búsqueda (nombre, folio, concepto)
    if (this.searchTerm.trim()) {
      const searchTerms = this.searchTerm.toLowerCase().trim().split(/\s+/);
      filtered = filtered.filter((estudiante) => {
        return searchTerms.every((term) => {
          const normalizedTerm = this.normalizeText(term);
          const fullName = this.normalizeText(estudiante.nombreCompleto);
          
          // Buscar en folio y conceptos de pagos
          const pagoMatch = estudiante.pagos.some(pago => {
            const folio = this.normalizeText(pago.folio);
            const conceptoMatch = pago.conceptos.some(concepto => 
              this.normalizeText(concepto).includes(normalizedTerm)
            );
            return folio.includes(normalizedTerm) || conceptoMatch;
          });
          
          return fullName.includes(normalizedTerm) || pagoMatch;
        });
      });
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

  async exportToExcel() {
    const workbook = new ExcelJS.Workbook();
    
    // Hoja de resumen de estudiantes
    const estudiantesSheet = workbook.addWorksheet('Resumen Estudiantes');
    estudiantesSheet.columns = [
      { header: 'Estudiante', key: 'estudiante', width: 30 },
      { header: 'Nivel', key: 'nivel', width: 15 },
      { header: 'Grado', key: 'grado', width: 10 },
      { header: 'Modalidad', key: 'modalidad', width: 15 },
      { header: 'Total Pagos', key: 'totalPagos', width: 12 },
      { header: 'Monto Total', key: 'montoTotal', width: 15 },
      { header: 'Fecha Último Pago', key: 'fechaUltimo', width: 18 }
    ];

    // Estilos para encabezados de estudiantes
    const headerRowEst = estudiantesSheet.getRow(1);
    headerRowEst.eachCell((cell, colNumber) => {
      let headerColor = '4472C4'; // Azul por defecto
      if (colNumber === 5) headerColor = '4472C4'; // Total Pagos - Azul
      if (colNumber === 6) headerColor = '70AD47'; // Monto Total - Verde
      
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
    this.filteredEstudiantesConPagos.forEach((estudiante, index) => {
      const row = estudiantesSheet.addRow({
        estudiante: estudiante.nombreCompleto,
        nivel: estudiante.nivel,
        grado: `${estudiante.grado}°`,
        modalidad: estudiante.modalidad,
        totalPagos: estudiante.totalPagos,
        montoTotal: estudiante.montoTotalPagado,
        fechaUltimo: estudiante.fechaUltimoPago ? estudiante.fechaUltimoPago.toLocaleDateString() : 'Sin pagos'
      });

      const isEvenRow = index % 2 === 0;
      row.eachCell((cell, colNumber) => {
        let cellColor = isEvenRow ? 'F2F2F2' : 'FFFFFF';
        
        // Colores especiales
        if (colNumber === 5) { // Total Pagos - Azul claro
          cellColor = isEvenRow ? 'E8F0FF' : 'F0F8FF';
        } else if (colNumber === 6) { // Monto Total - Verde claro
          cellColor = isEvenRow ? 'E8F5E8' : 'F0FFF0';
          cell.numFmt = '"$"#,##0.00';
        }

        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF' + cellColor }
        };
        cell.alignment = { 
          horizontal: colNumber >= 5 && colNumber <= 6 ? 'right' : 'left',
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

    // Hoja de detalle de pagos
    const pagosSheet = workbook.addWorksheet('Detalle Pagos');
    pagosSheet.columns = [
      { header: 'Estudiante', key: 'estudiante', width: 30 },
      { header: 'Nivel', key: 'nivel', width: 15 },
      { header: 'Grado', key: 'grado', width: 10 },
      { header: 'Modalidad', key: 'modalidad', width: 15 },
      { header: 'Folio', key: 'folio', width: 15 },
      { header: 'Monto', key: 'monto', width: 12 },
      { header: 'Método', key: 'metodo', width: 15 },
      { header: 'Fecha', key: 'fecha', width: 12 },
      { header: 'Conceptos Adeudos', key: 'adeudos', width: 25 },
      { header: 'Conceptos Requeridos', key: 'requeridos', width: 25 }
    ];

    // Estilos para encabezados de pagos
    const headerRowPagos = pagosSheet.getRow(1);
    headerRowPagos.eachCell((cell, colNumber) => {
      let headerColor = '4472C4';
      if (colNumber === 6) headerColor = '70AD47'; // Monto - Verde
      
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

    // Agregar datos de pagos
    let pagoIndex = 0;
    this.filteredEstudiantesConPagos.forEach((estudiante) => {
      estudiante.pagos.forEach((pago) => {
        const row = pagosSheet.addRow({
          estudiante: estudiante.nombreCompleto,
          nivel: estudiante.nivel,
          grado: `${estudiante.grado}°`,
          modalidad: estudiante.modalidad,
          folio: pago.folio,
          monto: pago.monto,
          metodo: pago.metodoPago,
          fecha: pago.fecha.toLocaleDateString(),
          adeudos: pago.adeudos.map((a: any) => a.nombre).join(', '),
          requeridos: pago.requeridos.map((r: any) => r.nombre).join(', ')
        });

        const isEvenRow = pagoIndex % 2 === 0;
        row.eachCell((cell, colNumber) => {
          let cellColor = isEvenRow ? 'F2F2F2' : 'FFFFFF';
          
          if (colNumber === 6) { // Monto - Verde claro
            cellColor = isEvenRow ? 'E8F5E8' : 'F0FFF0';
            cell.numFmt = '"$"#,##0.00';
          }

          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF' + cellColor }
          };
          cell.alignment = { 
            horizontal: colNumber === 6 ? 'right' : 'left',
            vertical: 'middle' 
          };
          cell.border = {
            top: { style: 'thin', color: { argb: 'FFD0D0D0' } },
            left: { style: 'thin', color: { argb: 'FFD0D0D0' } },
            bottom: { style: 'thin', color: { argb: 'FFD0D0D0' } },
            right: { style: 'thin', color: { argb: 'FFD0D0D0' } }
          };
        });
        pagoIndex++;
      });
    });

    // Guardar archivo
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'estudiantes_pagos.xlsx';
    link.click();
    window.URL.revokeObjectURL(url);
  }

  async exportStudentToExcel(estudiante: any) {
    const studentName = estudiante.nombreCompleto;
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Pagos');

    // Definir columnas para pagos
    worksheet.columns = [
      { header: 'Folio', key: 'folio', width: 15 },
      { header: 'Método de Pago', key: 'metodo', width: 15 },
      { header: 'Monto', key: 'monto', width: 12 },
      { header: 'Fecha de Pago', key: 'fecha', width: 15 },
      { header: 'Conceptos Adeudos', key: 'adeudos', width: 25 },
      { header: 'Conceptos Requeridos', key: 'requeridos', width: 25 }
    ];

    // Estilos para encabezados
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell, colNumber) => {
      let headerColor = '4472C4';
      if (colNumber === 3) headerColor = '70AD47'; // Monto - Verde
      
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

    // Agregar datos de pagos
    estudiante.pagos.forEach((pago: any, index: number) => {
      const row = worksheet.addRow({
        folio: pago.folio,
        metodo: pago.metodoPago === 'efectivo' ? 'Efectivo' : 'Transferencia',
        monto: pago.monto,
        fecha: pago.fecha.toLocaleDateString(),
        adeudos: pago.adeudos.map((a: any) => a.nombre).join(', '),
        requeridos: pago.requeridos.map((r: any) => r.nombre).join(', ')
      });

      const isEvenRow = index % 2 === 0;
      row.eachCell((cell, colNumber) => {
        let cellColor = isEvenRow ? 'F2F2F2' : 'FFFFFF';
        
        if (colNumber === 3) { // Monto - Verde claro
          cellColor = isEvenRow ? 'E8F5E8' : 'F0FFF0';
          cell.numFmt = '"$"#,##0.00';
        }

        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF' + cellColor }
        };
        cell.alignment = { 
          horizontal: colNumber === 3 ? 'right' : 'left',
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
    const lastRow = worksheet.lastRow?.number || 1;
    const summaryStartRow = lastRow + 2;
    
    // Encabezado de resumen
    const summaryHeaderRow = worksheet.getRow(summaryStartRow);
    summaryHeaderRow.getCell(1).value = 'Resumen del Estudiante';
    summaryHeaderRow.getCell(1).font = { bold: true, size: 14 };
    summaryHeaderRow.getCell(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };
    summaryHeaderRow.getCell(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    
    // Información del estudiante
    const studentInfo = [
      ['Nombre:', studentName],
      ['Nivel:', estudiante.nivel],
      ['Grado:', `${estudiante.grado}°`],
      ['Modalidad:', estudiante.modalidad],
      ['Último Pago:', estudiante.fechaUltimoPago ? estudiante.fechaUltimoPago.toLocaleDateString() : 'Sin pagos registrados'],
      ['Total de Pagos:', estudiante.totalPagos],
      ['Monto Total Pagado:', estudiante.montoTotalPagado]
    ];

    studentInfo.forEach((info, index) => {
      const row = worksheet.getRow(summaryStartRow + 2 + index);
      row.getCell(1).value = info[0];
      row.getCell(1).font = { bold: true };
      row.getCell(2).value = info[1];
      
      // Formato especial para totales
      if (index >= 5) { // Total de Pagos y Monto Total
        if (index === 5) { // Total de Pagos - Azul
          row.getCell(2).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE8F0FF' }
          };
        } else if (index === 6) { // Monto Total - Verde
          row.getCell(2).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE8F5E8' }
          };
          row.getCell(2).numFmt = '"$"#,##0.00';
        }
      }
    });

    // Guardar archivo
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const fileName = `pagos_${studentName.replace(/\s+/g, '_')}.xlsx`;
    link.download = fileName;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  normalizeText(text: string): string {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, ""); // Eliminar acentos
  }
}
