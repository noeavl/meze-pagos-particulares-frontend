import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { PaginatorModule } from 'primeng/paginator';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { useAdeudo } from '../../hooks/use-adeudo.hook';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-adeudo-detail',
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    TableModule,
    PaginatorModule,
    RouterLink,
    ProgressSpinnerModule,
  ],
  templateUrl: './adeudo-detail.html',
  styleUrl: './adeudo-detail.css',
})
export class AdeudoDetail implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  public adeudoService = inject(useAdeudo);

  adeudoId: number = 0;

  // Connect component signals to the appropriate hooks
  adeudo = this.adeudoService.adeudo;
  paymentHistory = this.adeudoService.paymentHistory;
  loading = this.adeudoService.loading;
  error = this.adeudoService.error;

  ngOnInit() {
    // Load initial adeudo information
    this.adeudoId = Number(this.route.snapshot.params['id']);
    if (this.adeudoId) {
      // Load adeudo details (which includes pagos)
      this.adeudoService.getAdeudoById(this.adeudoId).subscribe({
        error: () => {
          // Handle error loading initial data
          this.adeudoService.error.set(
            'No se pudo cargar la información del adeudo.'
          );
        },
      });
    } else {
      this.adeudoService.error.set('No se proporcionó un ID de adeudo válido.');
      this.router.navigate(['/adeudos']);
    }
  }
}
