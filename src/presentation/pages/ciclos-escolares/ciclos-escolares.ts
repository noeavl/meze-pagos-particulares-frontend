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
    const hoy = new Date();
    const fechaInicio = new Date(ciclo.fechaInicio);
    const fechaFin = new Date(ciclo.fechaFin);
    
    if (hoy >= fechaInicio && hoy <= fechaFin) {
      return 'activo';
    } else if (hoy < fechaInicio) {
      return 'proximo';
    } else {
      return 'finalizado';
    }
  }

  getClaseEstado(estado: string): string {
    switch (estado) {
      case 'activo':
        return 'bg-green-100 text-green-800';
      case 'proximo':
        return 'bg-blue-100 text-blue-800';
      case 'finalizado':
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
      case 'finalizado':
        return 'Finalizado';
      default:
        return 'Desconocido';
    }
  }

  exportToExcel() {
    const ciclosSheet = XLSX.utils.json_to_sheet(
      this.ciclosEscolares.map((c) => ({
        ID: c.id,
        'Nombre del Ciclo': c.nombre,
        'Fecha de Inicio': c.fechaInicio,
        'Fecha de Fin': c.fechaFin,
        'Estado': this.getTextoEstado(this.getEstadoCiclo(c)),
      }))
    );

    const ciclosBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(ciclosBook, ciclosSheet, "Ciclos Escolares");
    XLSX.writeFile(ciclosBook, "ciclos-escolares.xlsx");
  }
}