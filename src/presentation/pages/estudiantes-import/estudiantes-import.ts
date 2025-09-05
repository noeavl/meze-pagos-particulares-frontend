import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ProgressBarModule } from 'primeng/progressbar';
import * as ExcelJS from 'exceljs';
import { useEstudiante } from '../../hooks/use-estudiante.hook';
import { useNivel } from '../../hooks/use-nivel.hook';
import { useModalidad } from '../../hooks/use-modalidad.hook';
import { useGrado } from '../../hooks/use-grado.hook';
import { CreateEstudianteDto } from '../../../domain/entities/estudiante.entity';
import { GrupoUseCase } from '../../../domain/use-cases/grupo.use-case';
import { CicloEscolarUseCase } from '../../../domain/use-cases/ciclo-escolar.use-case';
import { CicloEscolar } from '../../../domain/entities/ciclo-escolar.entity';

interface ValidationError {
  row: number;
  errors: string[];
}

interface ProcessResults {
  total: number;
  valid: number;
  invalid: number;
  errors: ValidationError[];
  validRecords: CreateEstudianteDto[];
}

interface ImportProgress {
  current: number;
  total: number;
  percentage: number;
  success: number;
  failed: number;
  completed: boolean;
}

interface ExcelRow {
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  curp: string;
  ciclo_escolar: string;
  nivel: string;
  grado: string;
  modalidad: string;
  grupo?: string;
}

@Component({
  selector: 'app-estudiantes-import',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ButtonModule,
    ToastModule,
    ProgressBarModule
  ],
  templateUrl: './estudiantes-import.html',
  styleUrls: ['./estudiantes-import.css'],
  providers: [MessageService]
})
export class EstudiantesImport implements OnInit {
  private router = inject(Router);
  private messageService = inject(MessageService);
  private estudianteService = inject(useEstudiante);
  private nivelService = inject(useNivel);
  private modalidadService = inject(useModalidad);
  private gradoService = inject(useGrado);
  private grupoUseCase = inject(GrupoUseCase);
  private cicloEscolarUseCase = inject(CicloEscolarUseCase);

  selectedFile: File | null = null;
  processing = false;
  importing = false;
  processResults: ProcessResults | null = null;
  importProgress: ImportProgress | null = null;
  ciclosEscolares: CicloEscolar[] = [];

  ngOnInit() {
    this.loadInitialData();
  }

  private loadInitialData() {
    // Cargar datos necesarios para validaciones
    this.nivelService.loadNiveles();
    this.modalidadService.loadModalidades();
    this.gradoService.loadGradosByNivel('general');
    
    this.cicloEscolarUseCase.getAllCiclosEscolares().subscribe({
      next: (ciclos) => {
        this.ciclosEscolares = ciclos;
      },
      error: (error) => {
        console.error('Error loading ciclos escolares:', error);
      }
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (this.isValidExcelFile(file)) {
        this.selectedFile = file;
        this.processResults = null;
        this.importProgress = null;
      } else {
        this.showMessage('error', 'Error', 'Por favor selecciona un archivo Excel válido (.xlsx o .xls)');
      }
    }
  }

  private isValidExcelFile(file: File): boolean {
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    return validTypes.includes(file.type) || file.name.match(/\.(xlsx|xls)$/i) !== null;
  }

  clearFile() {
    this.selectedFile = null;
    this.processResults = null;
    this.importProgress = null;
  }

  formatFileSize(bytes: number, decimals = 2): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  async downloadTemplate() {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Plantilla Estudiantes');

    // Definir columnas con headers descriptivos
    worksheet.columns = [
      { header: 'Nombres *', key: 'nombres', width: 20 },
      { header: 'Apellido Paterno *', key: 'apellido_paterno', width: 20 },
      { header: 'Apellido Materno', key: 'apellido_materno', width: 20 },
      { header: 'CURP *', key: 'curp', width: 20 },
      { header: 'Ciclo Escolar *', key: 'ciclo_escolar', width: 25 },
      { header: 'Nivel *', key: 'nivel', width: 20 },
      { header: 'Grado *', key: 'grado', width: 10 },
      { header: 'Modalidad *', key: 'modalidad', width: 20 },
      { header: 'Grupo', key: 'grupo', width: 15 }
    ];

    // Aplicar estilos a los encabezados
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' }
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

    // Agregar ejemplos
    const examples = [
      {
        nombres: 'Juan Carlos',
        apellido_paterno: 'García',
        apellido_materno: 'López',
        curp: 'GALJ980615HPLRPN01',
        ciclo_escolar: this.ciclosEscolares.length > 0 ? this.ciclosEscolares[0].nombre : '2024-2025',
        nivel: 'primaria',
        grado: '3',
        modalidad: 'presencial',
        grupo: 'A'
      },
      {
        nombres: 'María Elena',
        apellido_paterno: 'Martínez',
        apellido_materno: 'Rodríguez',
        curp: 'MARE990225MPLDRN05',
        ciclo_escolar: this.ciclosEscolares.length > 0 ? this.ciclosEscolares[0].nombre : '2024-2025',
        nivel: 'secundaria',
        grado: '2',
        modalidad: 'en_linea',
        grupo: 'B'
      }
    ];

    examples.forEach((example, index) => {
      const row = worksheet.addRow(example);
      row.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: index % 2 === 0 ? 'FFE8F0FF' : 'FFFFFFFF' }
        };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFD0D0D0' } },
          left: { style: 'thin', color: { argb: 'FFD0D0D0' } },
          bottom: { style: 'thin', color: { argb: 'FFD0D0D0' } },
          right: { style: 'thin', color: { argb: 'FFD0D0D0' } }
        };
      });
    });

    // Agregar hoja de instrucciones
    const instructionsSheet = workbook.addWorksheet('Instrucciones');
    const instructions = [
      ['INSTRUCCIONES PARA IMPORTAR ESTUDIANTES', ''],
      ['', ''],
      ['Campos obligatorios (marcados con *):', ''],
      ['• Nombres', 'Mínimo 2 caracteres'],
      ['• Apellido Paterno', 'Mínimo 2 caracteres'],
      ['• CURP', 'Formato: GALJ980615HPLRPN01 (18 caracteres)'],
      ['• Ciclo Escolar', 'Debe existir en el sistema'],
      ['• Nivel', 'Opciones: preescolar, primaria, secundaria, bachillerato, bachillerato_sabatino'],
      ['• Grado', 'Número correspondiente al nivel'],
      ['• Modalidad', 'Opciones: presencial, en_linea'],
      ['', ''],
      ['Campos opcionales:', ''],
      ['• Apellido Materno', 'Mínimo 2 caracteres si se proporciona'],
      ['• Grupo', 'Debe existir para el nivel, grado y modalidad especificados'],
      ['', ''],
      ['NOTAS IMPORTANTES:', ''],
      ['• No modifiques los nombres de las columnas', ''],
      ['• Elimina las filas de ejemplo antes de importar', ''],
      ['• Guarda el archivo en formato .xlsx', ''],
      ['• Máximo 1000 registros por importación', '']
    ];

    instructions.forEach((instruction, index) => {
      const row = instructionsSheet.addRow(instruction);
      if (index === 0) {
        row.getCell(1).font = { bold: true, size: 14 };
        row.getCell(1).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF4472C4' }
        };
        row.getCell(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      } else if (instruction[0].includes('•') || instruction[0].includes('NOTAS')) {
        row.getCell(1).font = { bold: true };
      }
    });

    instructionsSheet.getColumn(1).width = 50;
    instructionsSheet.getColumn(2).width = 30;

    // Guardar archivo
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'plantilla_estudiantes.xlsx';
    link.click();
    window.URL.revokeObjectURL(url);

    this.showMessage('success', 'Éxito', 'Plantilla descargada correctamente');
  }

  async processFile() {
    if (!this.selectedFile) return;

    this.processing = true;
    this.processResults = null;

    try {
      const buffer = await this.selectedFile.arrayBuffer();
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);

      const worksheet = workbook.getWorksheet(1);
      if (!worksheet) {
        throw new Error('No se encontró ninguna hoja en el archivo');
      }

      const records: ExcelRow[] = [];
      const errors: ValidationError[] = [];

      // Procesar filas (empezar desde la fila 2, la 1 son los headers)
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Skip header row
        if (rowNumber > 1001) return; // Limit to 1000 records

        try {
          const record: ExcelRow = {
            nombres: this.getCellValue(row, 1),
            apellido_paterno: this.getCellValue(row, 2),
            apellido_materno: this.getCellValue(row, 3),
            curp: this.getCellValue(row, 4),
            ciclo_escolar: this.getCellValue(row, 5),
            nivel: this.getCellValue(row, 6),
            grado: this.getCellValue(row, 7),
            modalidad: this.getCellValue(row, 8),
            grupo: this.getCellValue(row, 9)
          };

          // Skip empty rows
          if (!record.nombres && !record.apellido_paterno && !record.curp) return;

          records.push(record);
        } catch (error) {
          errors.push({
            row: rowNumber,
            errors: ['Error al leer los datos de la fila']
          });
        }
      });

      // Validar cada registro
      const validRecords: CreateEstudianteDto[] = [];
      for (let i = 0; i < records.length; i++) {
        const record = records[i];
        const rowNumber = i + 2; // +2 because we started from row 2 and array is 0-indexed
        const rowErrors = await this.validateRecord(record);
        
        if (rowErrors.length > 0) {
          errors.push({
            row: rowNumber,
            errors: rowErrors
          });
        } else {
          // Convertir a DTO
          const dto = await this.convertToCreateDto(record);
          if (dto) {
            validRecords.push(dto);
          }
        }
      }

      this.processResults = {
        total: records.length,
        valid: validRecords.length,
        invalid: errors.length,
        errors: errors,
        validRecords: validRecords
      };

      this.showMessage('success', 'Procesamiento completado', 
        `Se procesaron ${records.length} registros. ${validRecords.length} válidos, ${errors.length} con errores.`);

    } catch (error: any) {
      this.showMessage('error', 'Error', `Error al procesar el archivo: ${error.message}`);
    } finally {
      this.processing = false;
    }
  }

  private getCellValue(row: any, columnIndex: number): string {
    const cell = row.getCell(columnIndex);
    if (!cell || cell.value === null || cell.value === undefined) return '';
    return cell.value.toString().trim();
  }

  private async validateRecord(record: ExcelRow): Promise<string[]> {
    const errors: string[] = [];

    // Validaciones básicas
    if (!record.nombres || record.nombres.length < 2) {
      errors.push('Nombres es requerido y debe tener al menos 2 caracteres');
    }

    if (!record.apellido_paterno || record.apellido_paterno.length < 2) {
      errors.push('Apellido Paterno es requerido y debe tener al menos 2 caracteres');
    }

    if (record.apellido_materno && record.apellido_materno.length < 2) {
      errors.push('Apellido Materno debe tener al menos 2 caracteres si se proporciona');
    }

    // Validar CURP
    if (!record.curp) {
      errors.push('CURP es requerido');
    } else {
      const curpRegex = /^[A-Z]{4}[0-9]{6}[H,M][A-Z]{5}[0-9,A-Z]{2}$/;
      if (!curpRegex.test(record.curp.toUpperCase())) {
        errors.push('CURP no tiene el formato correcto (ejemplo: GALJ980615HPLRPN01)');
      }
    }

    // Validar ciclo escolar
    if (!record.ciclo_escolar) {
      errors.push('Ciclo Escolar es requerido');
    } else {
      const cicloExists = this.ciclosEscolares.some(c => c.nombre === record.ciclo_escolar);
      if (!cicloExists) {
        errors.push(`Ciclo Escolar "${record.ciclo_escolar}" no existe en el sistema`);
      }
    }

    // Validar nivel
    const validNiveles = ['preescolar', 'primaria', 'secundaria', 'bachillerato', 'bachillerato_sabatino'];
    if (!record.nivel) {
      errors.push('Nivel es requerido');
    } else if (!validNiveles.includes(record.nivel.toLowerCase())) {
      errors.push(`Nivel debe ser uno de: ${validNiveles.join(', ')}`);
    }

    // Validar modalidad
    const validModalidades = ['presencial', 'en_linea'];
    if (!record.modalidad) {
      errors.push('Modalidad es requerida');
    } else if (!validModalidades.includes(record.modalidad.toLowerCase())) {
      errors.push(`Modalidad debe ser una de: ${validModalidades.join(', ')}`);
    }

    // Validar grado
    if (!record.grado) {
      errors.push('Grado es requerido');
    } else {
      const grado = parseInt(record.grado);
      if (isNaN(grado)) {
        errors.push('Grado debe ser un número');
      } else {
        // Validar según el nivel
        const nivel = record.nivel?.toLowerCase();
        if (nivel === 'preescolar' && (grado < 1 || grado > 3)) {
          errors.push('Grado para preescolar debe ser entre 1 y 3');
        } else if (nivel === 'primaria' && (grado < 1 || grado > 6)) {
          errors.push('Grado para primaria debe ser entre 1 y 6');
        } else if (nivel === 'secundaria' && (grado < 1 || grado > 3)) {
          errors.push('Grado para secundaria debe ser entre 1 y 3');
        } else if ((nivel === 'bachillerato' || nivel === 'bachillerato_sabatino') && (grado < 1 || grado > 3)) {
          errors.push('Grado para bachillerato debe ser entre 1 y 3');
        }
      }
    }

    return errors;
  }

  private async convertToCreateDto(record: ExcelRow): Promise<CreateEstudianteDto | null> {
    try {
      const ciclo = this.ciclosEscolares.find(c => c.nombre === record.ciclo_escolar);
      if (!ciclo) return null;

      // Buscar grupo si se proporciona
      let grupo_id: number | undefined;
      if (record.grupo) {
        // Aquí podrías implementar la lógica para buscar el grupo
        // Por ahora lo dejamos opcional
      }

      return {
        nombres: record.nombres,
        apellido_paterno: record.apellido_paterno,
        apellido_materno: record.apellido_materno || '',
        curp: record.curp.toUpperCase(),
        ciclo_escolar_id: ciclo.id,
        nivel: record.nivel.toLowerCase(),
        grado: record.grado,
        modalidad: record.modalidad.toLowerCase(),
        grupo_id: grupo_id
      };
    } catch (error) {
      return null;
    }
  }

  async importValidRecords() {
    if (!this.processResults || this.processResults.validRecords.length === 0) return;

    this.importing = true;
    const records = this.processResults.validRecords;
    
    this.importProgress = {
      current: 0,
      total: records.length,
      percentage: 0,
      success: 0,
      failed: 0,
      completed: false
    };

    // Importar de a uno para mostrar progreso
    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      
      try {
        await this.estudianteService.createEstudiante(record).toPromise();
        this.importProgress.success++;
      } catch (error) {
        this.importProgress.failed++;
        console.error(`Error importing record ${i + 1}:`, error);
      }

      this.importProgress.current = i + 1;
      this.importProgress.percentage = Math.round((this.importProgress.current / this.importProgress.total) * 100);

      // Pequeña pausa para que se vea el progreso
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.importProgress.completed = true;
    this.importing = false;

    this.showMessage('success', 'Importación completada', 
      `Se importaron ${this.importProgress.success} estudiantes exitosamente. ${this.importProgress.failed} fallos.`);
  }

  async downloadErrorReport() {
    if (!this.processResults || this.processResults.errors.length === 0) return;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Errores de Importación');

    worksheet.columns = [
      { header: 'Fila', key: 'row', width: 8 },
      { header: 'Errores', key: 'errors', width: 60 }
    ];

    // Estilos para encabezados
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFDC3545' }
      };
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });

    // Agregar errores
    this.processResults.errors.forEach((error, index) => {
      const row = worksheet.addRow({
        row: error.row,
        errors: error.errors.join('; ')
      });

      row.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: index % 2 === 0 ? 'FFFFEAEA' : 'FFFFFFFF' }
        };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFD0D0D0' } },
          left: { style: 'thin', color: { argb: 'FFD0D0D0' } },
          bottom: { style: 'thin', color: { argb: 'FFD0D0D0' } },
          right: { style: 'thin', color: { argb: 'FFD0D0D0' } }
        };
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'errores_importacion_estudiantes.xlsx';
    link.click();
    window.URL.revokeObjectURL(url);
  }

  resetImport() {
    this.selectedFile = null;
    this.processResults = null;
    this.importProgress = null;
    this.processing = false;
    this.importing = false;
  }

  private showMessage(severity: string, summary: string, detail: string) {
    this.messageService.add({
      severity,
      summary,
      detail,
      key: 'br',
      life: 3000
    });
  }
}