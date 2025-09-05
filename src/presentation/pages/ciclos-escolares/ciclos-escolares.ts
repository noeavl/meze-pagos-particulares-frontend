import { Component, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TableModule } from "primeng/table";
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { TagModule } from "primeng/tag";
import { TooltipModule } from "primeng/tooltip";
import { useCicloEscolar } from "../../hooks/use-ciclo-escolar.hook";
import { CicloEscolar } from "../../../domain/entities/ciclo-escolar.entity";
import { RouterLink } from "@angular/router";
import * as XLSX from "xlsx";
import * as ExcelJS from 'exceljs';

@Component({
  selector: "app-ciclos-escolares",
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    TooltipModule,
    RouterLink,
  ],
  templateUrl: "./ciclos-escolares.html",
  styleUrl: "./ciclos-escolares.css",
})
export class CiclosEscolares implements OnInit {
  cicloEscolarService = inject(useCicloEscolar);

  constructor() {}

  ngOnInit() {
    this.cicloEscolarService.loadCiclosEscolares();
  }

  get ciclosEscolares() {
    return this.cicloEscolarService.ciclosEscolares();
  }

  get loading() {
    return this.cicloEscolarService.loading();
  }

  get error() {
    return this.cicloEscolarService.error();
  }

  getEstadoCiclo(ciclo: CicloEscolar): string {
    return ciclo.estado;
  }

  getClaseEstado(estado: string): string {
    switch (estado) {
      case 'activo':
        return 'bg-green-100 text-green-800';
      case 'proximo':
        return 'bg-blue-100 text-blue-800';
      case 'inactivo':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getTextoEstado(estado: string): string {
    switch (estado) {
      case 'activo':
        return 'Activo';
      case 'proximo':
        return 'Próximo';
      case 'inactivo':
        return 'Inactivo';
      default:
        return 'Desconocido';
    }
  }

  async exportToExcel() {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Ciclos Escolares');

    // Definir columnas
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 8 },
      { header: 'Nombre del Ciclo', key: 'nombre', width: 25 },
      { header: 'Fecha de Inicio', key: 'fechaInicio', width: 15 },
      { header: 'Fecha de Fin', key: 'fechaFin', width: 15 },
      { header: 'Estado', key: 'estado', width: 12 }
    ];

    // Aplicar estilos a los encabezados
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell, colNumber) => {
      let headerColor = '4472C4'; // Azul por defecto
      
      if (colNumber === 5) headerColor = '70AD47'; // Estado - Verde

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
    this.ciclosEscolares.forEach((ciclo, index) => {
      const estado = this.getEstadoCiclo(ciclo);
      const row = worksheet.addRow({
        id: ciclo.id,
        nombre: ciclo.nombre,
        fechaInicio: ciclo.fechaInicio,
        fechaFin: ciclo.fechaFin,
        estado: this.getTextoEstado(estado)
      });

      const isEvenRow = index % 2 === 0;

      // Aplicar estilos a cada celda
      row.eachCell((cell, colNumber) => {
        let cellColor = isEvenRow ? 'F2F2F2' : 'FFFFFF';
        
        // Color especial para estado según el valor
        if (colNumber === 5) {
          switch (estado) {
            case 'activo':
              cellColor = isEvenRow ? 'E8F5E8' : 'F0FFF0'; // Verde para activo
              break;
            case 'proximo':
              cellColor = isEvenRow ? 'E8F0FF' : 'F0F8FF'; // Azul para próximo
              break;
            case 'inactivo':
              cellColor = isEvenRow ? 'FFE8E8' : 'FFF0F0'; // Rojo claro para inactivo
              break;
          }
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
    link.download = 'ciclos-escolares.xlsx';
    link.click();
    window.URL.revokeObjectURL(url);
  }
}