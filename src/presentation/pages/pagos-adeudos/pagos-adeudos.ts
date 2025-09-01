import { Component, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { TableModule } from "primeng/table";
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { TagModule } from "primeng/tag";
import { TooltipModule } from "primeng/tooltip";
import { usePago } from "../../hooks/use-pago.hook";
import * as XLSX from "xlsx";

@Component({
  selector: "app-pagos-adeudos",
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    TooltipModule,
  ],
  templateUrl: "./pagos-adeudos.html",
  styleUrl: "./pagos-adeudos.css",
})
export class PagosAdeudos implements OnInit {
  pagoService = inject(usePago);

  searchTerm: string = "";

  constructor() {}

  ngOnInit() {
    this.pagoService.loadPagosAdeudos();
  }

  pagosAdeudos = this.pagoService.pagosAdeudos;
  loading = this.pagoService.loading;
  error = this.pagoService.error;

  get filteredPagosAdeudos() {
    let filtered = this.pagosAdeudos();

    if (this.searchTerm.trim()) {
      filtered = filtered.filter(
        (pagoAdeudo) =>
          pagoAdeudo.folio
            .toLowerCase()
            .includes(this.searchTerm.toLowerCase()) ||
          pagoAdeudo.metodoPago
            .toLowerCase()
            .includes(this.searchTerm.toLowerCase())
      );
    }

    return filtered;
  }

  onSearch(event: any) {
    this.searchTerm = event.target.value;
  }

  exportToExcel() {
    const pagosAdeudosSheet = XLSX.utils.json_to_sheet(
      this.filteredPagosAdeudos.map((p) => ({
        Folio: p.folio,
        Estudiante: p.nombreCompleto,
        Concepto: p.concepto,
        Metodo: p.metodoPago,
        Monto: p.monto,
        Total: p.montoTotal,
        "Fecha pago": new Date(p.fecha).toLocaleDateString(),
        Vencimiento: new Date(p.fechaVencimiento).toLocaleDateString(),
      }))
    );

    const pagosAdeudosBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      pagosAdeudosBook,
      pagosAdeudosSheet,
      "Pagos de adeudos"
    );

    XLSX.writeFile(pagosAdeudosBook, "pagos_adeudos.xlsx");
  }
}
