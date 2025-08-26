import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { useConcepto } from '../../hooks/use-concepto.hook';
import { Concepto } from '../../../domain/entities/concepto.entity';

@Component({
  selector: 'app-concepto-detail',
  imports: [
    CommonModule,
    RouterLink,
    ButtonModule,
    ProgressSpinnerModule
  ],
  templateUrl: './concepto-detail.html',
  styleUrls: ['./concepto-detail.css']
})
export class ConceptoDetailComponent implements OnInit {
  concepto = signal<Concepto | null>(null);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private conceptoHook: useConcepto
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = Number(params['id']);
      if (id && !isNaN(id)) {
        this.loadConcepto(id);
      } else {
        this.error.set('ID de concepto inválido');
      }
    });
  }

  private loadConcepto(id: number) {
    this.loading.set(true);
    this.error.set(null);

    this.conceptoHook.getConceptoById(id).subscribe({
      next: (concepto) => {
        this.concepto.set(concepto);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar el concepto: ' + err.message);
        this.loading.set(false);
      }
    });
  }
}