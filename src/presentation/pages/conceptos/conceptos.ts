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

  exportToExcel() {
    const conceptosSheet = XLSX.utils.json_to_sheet(
      this.conceptos.map((c) => ({
        Concepto: c.nombre,
        Periodo: c.periodo,
        Nivel: c.nivel,
        Modalidad: c.modalidad,
        Costo: c.costo,
      }))
    );

    const conceptosBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(conceptosBook, conceptosSheet, "Conceptos");
    XLSX.writeFile(conceptosBook, "conceptos.xlsx");
  }
}
