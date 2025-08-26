import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { useEstudiante } from '../../hooks/use-estudiante.hook';
import { Estudiante } from '../../../domain/entities/estudiante.entity';

@Component({
  selector: 'app-estudiante-detail',
  imports: [
    CommonModule,
    RouterLink,
    ButtonModule,
    ProgressSpinnerModule
  ],
  templateUrl: './estudiante-detail.html',
  styleUrls: ['./estudiante-detail.css']
})
export class EstudianteDetailComponent implements OnInit {
  estudiante = signal<Estudiante | null>(null);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private estudianteHook: useEstudiante
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = Number(params['id']);
      if (id && !isNaN(id)) {
        this.loadEstudiante(id);
      } else {
        this.error.set('ID de estudiante inválido');
      }
    });
  }

  private loadEstudiante(id: number) {
    this.loading.set(true);
    this.error.set(null);

    this.estudianteHook.getEstudianteById(id).subscribe({
      next: (estudiante) => {
        this.estudiante.set(estudiante);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar el estudiante: ' + err.message);
        this.loading.set(false);
      }
    });
  }
}