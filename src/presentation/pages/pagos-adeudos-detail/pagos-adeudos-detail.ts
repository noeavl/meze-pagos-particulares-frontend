import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ButtonDirective } from 'primeng/button';
import { ProgressSpinner } from 'primeng/progressspinner';
import { TableModule } from 'primeng/table';
import { useAdeudo } from '../../hooks/use-adeudo.hook';

@Component({
  selector: 'app-pagos-adeudos-detail',
  imports: [
    CommonModule,
    RouterLink,
    ButtonDirective,
    ProgressSpinner,
    TableModule
  ],
  templateUrl: './pagos-adeudos-detail.html',
  styleUrl: './pagos-adeudos-detail.css'
})
export class PagosAdeudosDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private adeudoService = inject(useAdeudo);
  
  adeudoId: number = 0;

  ngOnInit() {
    this.adeudoId = Number(this.route.snapshot.params['id']);
    if (this.adeudoId) {
      this.adeudoService.getAdeudoById(this.adeudoId).subscribe();
    }
  }

  get adeudo() {
    return this.adeudoService.adeudo();
  }

  get loading() {
    return this.adeudoService.loading();
  }

  get error() {
    return this.adeudoService.error();
  }

  get pagos() {
    // Por ahora retornamos un array vacío hasta que se implemente el historial de pagos
    return [];
  }
}
