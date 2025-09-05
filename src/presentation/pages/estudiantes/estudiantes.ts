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
import { useEstudiante } from "../../hooks/use-estudiante.hook";
import { useNivel } from "../../hooks/use-nivel.hook";
import { useModalidad } from "../../hooks/use-modalidad.hook";
import { useGrado } from "../../hooks/use-grado.hook";
import { RouterLink } from "@angular/router";
import { DialogModule } from "primeng/dialog";
import { MessageService } from "primeng/api";
import { ToastModule } from "primeng/toast";
import { Estudiante } from "../../../domain/entities/estudiante.entity";
import * as XLSX from "xlsx";
import * as ExcelJS from 'exceljs';

@Component({
  selector: "app-estudiantes",
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
    RouterLink,
    DialogModule,
    ToastModule,
  ],
  templateUrl: "./estudiantes.html",
  styleUrl: "./estudiantes.css",
  providers: [MessageService],
})
export class Estudiantes implements OnInit {
  visible: boolean = false;
  selectedEstudiante: Estudiante | null = null;
  estudianteService = inject(useEstudiante);
  nivelService = inject(useNivel);
  modalidadService = inject(useModalidad);
  gradoService = inject(useGrado);
  messageService = inject(MessageService);

  showDialog(estudiante: Estudiante) {
    this.selectedEstudiante = estudiante;
    this.visible = true;
  }

  async updateEstadoEstudiante() {
    if (!this.selectedEstudiante) return;

    const newEstado = !this.selectedEstudiante.estado;

    try {
      await this.estudianteService
        .updateEstudianteEstado(this.selectedEstudiante.id, newEstado)
        .toPromise();

      // Actualizar el estudiante en la lista local
      const estudiantes = this.estudianteService.estudiantes();
      const updatedEstudiantes = estudiantes.map((est) =>
        est.id === this.selectedEstudiante!.id
          ? { ...est, estado: newEstado }
          : est
      );
      this.estudianteService.estudiantes.set(updatedEstudiantes);

      this.messageService.add({
        severity: "success",
        summary: "Éxito",
        detail: `Estado del estudiante ${
          newEstado ? "activado" : "desactivado"
        } correctamente`,
        life: 1500,
      });

      this.visible = false;
      this.selectedEstudiante = null;
    } catch (error) {
      this.messageService.add({
        severity: "error",
        summary: "Error",
        detail: "No se pudo actualizar el estado del estudiante",
        life: 1500,
      });
    }
  }

  cancelDialog() {
    this.visible = false;
    this.selectedEstudiante = null;
  }

  // Filtros y búsqueda
  selectedNivel: string = "general";
  selectedModalidad: string = "general";
  selectedGrado: string = "general";
  searchTerm: string = "";

  // Opciones de filtros dinámicas
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
    this.estudianteService.loadEstudiantes();
    this.nivelService.loadNiveles();
    this.modalidadService.loadModalidades();
    // Load grados for general nivel by default
    this.gradoService.loadGradosByNivel('general');
  }

  estudiantes = this.estudianteService.estudiantes;
  loading = this.estudianteService.loading;
  error = this.estudianteService.error;

  get filteredEstudiantes() {
    let filtered = this.estudiantes();

    // Filtrar por nivel si está seleccionado y no es "general"
    if (this.selectedNivel && this.selectedNivel !== "general") {
      filtered = filtered.filter(
        (estudiante) => estudiante.nivel.rawValue === this.selectedNivel
      );
    }

    // Filtrar por modalidad si está seleccionada y no es "general"
    if (this.selectedModalidad && this.selectedModalidad !== "general") {
      filtered = filtered.filter(
        (estudiante) => estudiante.modalidad.rawValue === this.selectedModalidad
      );
    }

    // Filtrar por grado si está seleccionado y no es "general"
    if (this.selectedGrado && this.selectedGrado !== "general") {
      filtered = filtered.filter(
        (estudiante) => estudiante.grado.toString() === this.selectedGrado
      );
    }

    // Filtrar por término de búsqueda (nombre, apellidos, CURP y grupo)
    if (this.searchTerm.trim()) {
      const searchTerms = this.searchTerm.toLowerCase().trim().split(/\s+/);
      filtered = filtered.filter((estudiante) => {
        return searchTerms.every((term) => {
          const fullName = this.normalizeText(
            `${estudiante.nombres} ${estudiante.apellidoPaterno} ${estudiante.apellidoMaterno}`
          );
          const curp = this.normalizeText(estudiante.curp || "");
          const grupo = this.normalizeText(estudiante.grupo || "");
          const normalizedTerm = this.normalizeText(term);
          
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

  get estudiantesPorNivel() {
    const conteos = {
      preescolar: 0,
      primaria: 0,
      secundaria: 0,
      bachillerato: 0,
      bachillerato_sabatino: 0,
    };

    this.filteredEstudiantes.forEach((estudiante) => {
      const nivel = estudiante.nivel.rawValue as keyof typeof conteos;
      if (conteos.hasOwnProperty(nivel)) {
        conteos[nivel]++;
      }
    });

    return conteos;
  }


  onSearch(event: any) {
    this.searchTerm = event.target.value;
  }

  onNivelChange() {
    // Reset grado selection when nivel changes
    if (this.selectedNivel === 'general') {
      this.selectedGrado = "general";
    } else {
      this.selectedGrado = "general";
      // Load grados for selected nivel
      this.gradoService.loadGradosByNivel(this.selectedNivel);
    }
  }

  onModalidadChange() {
    // El filtro se aplica automáticamente a través del getter filteredEstudiantes
  }

  onGradoChange() {
    // El filtro se aplica automáticamente a través del getter filteredEstudiantes
  }

  async exportToExcel() {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Estudiantes');

    // Definir columnas
    worksheet.columns = [
      { header: 'Nombre Completo', key: 'nombre', width: 35 },
      { header: 'CURP', key: 'curp', width: 20 },
      { header: 'Nivel', key: 'nivel', width: 15 },
      { header: 'Grado', key: 'grado', width: 8 },
      { header: 'Grupo', key: 'grupo', width: 10 },
      { header: 'Modalidad', key: 'modalidad', width: 15 },
      { header: 'Estado', key: 'estado', width: 12 }
    ];

    // Aplicar estilos a los encabezados
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell, colNumber) => {
      let headerColor = '4472C4'; // Azul por defecto
      
      if (colNumber === 7) headerColor = '70AD47'; // Estado - Verde

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
    this.filteredEstudiantes.forEach((estudiante, index) => {
      const row = worksheet.addRow({
        nombre: `${estudiante.nombres} ${estudiante.apellidoPaterno} ${estudiante.apellidoMaterno}`,
        curp: estudiante.curp,
        nivel: estudiante.nivel.displayValue,
        grado: estudiante.grado,
        grupo: estudiante.grupo || 'N/A',
        modalidad: estudiante.modalidad.displayValue,
        estado: estudiante.estado ? 'Activo' : 'Inactivo'
      });

      const isEvenRow = index % 2 === 0;

      // Aplicar estilos a cada celda
      row.eachCell((cell, colNumber) => {
        let cellColor = isEvenRow ? 'F2F2F2' : 'FFFFFF';
        
        // Color especial para estado
        if (colNumber === 7) {
          if (estudiante.estado) {
            cellColor = isEvenRow ? 'E8F5E8' : 'F0FFF0'; // Verde para activos
          } else {
            cellColor = isEvenRow ? 'FFE8E8' : 'FFF0F0'; // Rojo claro para inactivos
          }
        }

        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF' + cellColor }
        };
        
        cell.alignment = { 
          horizontal: 'left',
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
    link.download = 'estudiantes.xlsx';
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
