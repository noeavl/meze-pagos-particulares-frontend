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

  exportToExcel() {
    const worksheet = XLSX.utils.json_to_sheet(
      this.grupos.map((g) => ({
        ID: g.id,
        Nombre: g.nombre,
        "Ciclo Escolar": g.ciclo_escolar?.nombre,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Grupos");
    XLSX.writeFile(workbook, "grupos.xlsx");
  }
}
