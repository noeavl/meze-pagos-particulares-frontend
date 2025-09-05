import { Component, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TableModule } from "primeng/table";
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { TagModule } from "primeng/tag";
import { TooltipModule } from "primeng/tooltip";
import { useConcepto } from "../../hooks/use-concepto.hook";
import { Concepto } from "../../../domain/entities/concepto.entity";
import { RouterLink } from "@angular/router";
import * as XLSX from "xlsx";
import * as ExcelJS from 'exceljs';

@Component({
  selector: "app-conceptos",
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    TooltipModule,
    RouterLink,
  ],
  templateUrl: "./conceptos.html",
  styleUrl: "./conceptos.css",
})
export class Conceptos implements OnInit {
  conceptoService = inject(useConcepto);

  constructor() {}

  ngOnInit() {
    this.conceptoService.loadConceptos();
  }

  get conceptos() {
    return this.conceptoService.conceptos();
  }

  get loading() {
    return this.conceptoService.loading();
  }

  get error() {
    return this.conceptoService.error();
  }

  onSearch(event: any) {
    const searchTerm = event.target.value;
    if (searchTerm.trim()) {
      this.conceptoService.searchConceptos(searchTerm);
    } else {
      this.conceptoService.loadConceptos();
    }
  }

  async exportToExcel() {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Conceptos');

    // Definir columnas
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 8 },
      { header: 'Concepto', key: 'concepto', width: 25 },
      { header: 'Tipo', key: 'tipo', width: 12 },
      { header: 'Periodo', key: 'periodo', width: 15 },
      { header: 'Nivel', key: 'nivel', width: 15 },
      { header: 'Modalidad', key: 'modalidad', width: 15 },
      { header: 'Costo', key: 'costo', width: 12 }
    ];

    // Aplicar estilos a los encabezados
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell, colNumber) => {
      let headerColor = '4472C4'; // Azul por defecto
      
      if (colNumber === 7) headerColor = '70AD47'; // Costo - Verde
      
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

    // Agregar datos
    this.conceptos.forEach((concepto, index) => {
      const row = worksheet.addRow({
        id: concepto.id,
        concepto: concepto.nombre,
        tipo: concepto.tipo === 'adeudo' ? 'Adeudo' : 'Requerido',
        periodo: concepto.periodo.displayValue,
        nivel: concepto.nivel?.displayValue || 'General',
        modalidad: concepto.modalidad?.displayValue || 'General',
        costo: concepto.costo
      });

      const isEvenRow = index % 2 === 0;

      // Aplicar estilos a cada celda
      row.eachCell((cell, colNumber) => {
        let cellColor = isEvenRow ? 'F2F2F2' : 'FFFFFF';
        
        // Color especial para costo
        if (colNumber === 7) {
          cellColor = isEvenRow ? 'E8F5E8' : 'F0FFF0';
          cell.numFmt = '"$"#,##0.00';
        }

        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF' + cellColor }
        };
        
        cell.alignment = { 
          horizontal: colNumber === 7 ? 'right' : 'left',
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

    // Guardar archivo
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'conceptos.xlsx';
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
