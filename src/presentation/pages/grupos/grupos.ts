import { Component, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TableModule } from "primeng/table";
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { TagModule } from "primeng/tag";
import { TooltipModule } from "primeng/tooltip";
import { useGrupo } from "../../hooks/use-grupo.hook";
import { Grupo } from "../../../domain/entities/grupo.entity";
import { RouterLink } from "@angular/router";
import * as XLSX from "xlsx";
import * as ExcelJS from 'exceljs';

@Component({
  selector: "app-grupos",
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    TooltipModule,
    RouterLink,
  ],
  templateUrl: "./grupos.html",
  styleUrl: "./grupos.css",
})
export class Grupos implements OnInit {
  grupoService = useGrupo();

  constructor() {}

  ngOnInit() {
    this.grupoService.loadGrupos();
  }

  get grupos() {
    return this.grupoService.grupos();
  }

  get loading() {
    return this.grupoService.loading();
  }

  get error() {
    return this.grupoService.error();
  }

  async exportToExcel() {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Grupos');

    // Definir columnas
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 8 },
      { header: 'Nombre', key: 'nombre', width: 20 },
      { header: 'Ciclo Escolar', key: 'cicloEscolar', width: 25 }
    ];

    // Aplicar estilos a los encabezados
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell, colNumber) => {
      let headerColor = '4472C4'; // Azul por defecto
      
      if (colNumber === 3) headerColor = '70AD47'; // Ciclo Escolar - Verde

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
    this.grupos.forEach((grupo, index) => {
      const row = worksheet.addRow({
        id: grupo.id,
        nombre: grupo.nombre,
        cicloEscolar: grupo.ciclo_escolar?.nombre || 'N/A'
      });

      const isEvenRow = index % 2 === 0;

      // Aplicar estilos a cada celda
      row.eachCell((cell, colNumber) => {
        let cellColor = isEvenRow ? 'F2F2F2' : 'FFFFFF';
        
        // Color especial para ciclo escolar
        if (colNumber === 3) {
          cellColor = isEvenRow ? 'E8F5E8' : 'F0FFF0'; // Verde claro
        }

        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF' + cellColor }
        };
        
        cell.alignment = { 
          horizontal: colNumber === 1 ? 'center' : 'left',
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
    link.download = 'grupos.xlsx';
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
