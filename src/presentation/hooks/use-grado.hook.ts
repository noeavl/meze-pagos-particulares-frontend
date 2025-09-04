import { Injectable, signal } from '@angular/core';
import { GradoUseCase } from '../../domain/use-cases/grado.use-case';
import { GradoEntity } from '../../domain/entities/grado.entity';

@Injectable({
  providedIn: 'root',
})
export class useGrado {
  grados = signal<GradoEntity[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  constructor(private gradoUseCase: GradoUseCase) {}

  loadGradosByNivel(nivel: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.gradoUseCase.getGradosByNivel(nivel).subscribe({
      next: (grados) => {
        this.grados.set(grados);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading grados:', error);
        this.error.set('Error al cargar los grados');
        this.loading.set(false);
        // En caso de error, usar general como fallback
        this.loadGradosByNivel('general');
      },
    });
  }

  getGradosOptions() {
    return this.grados().map(grado => ({
      label: `${grado.numero}°`,
      value: grado.numero
    }));
  }

  getGradosOptionsForSelect() {
    const grados = this.grados();
    return [
      { label: 'General', value: 'general' },
      ...this.getGradosOptions()
    ];
  }
}