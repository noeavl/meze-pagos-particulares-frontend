import { Injectable, signal } from '@angular/core';
import { NivelUseCase } from '../../domain/use-cases/nivel.use-case';
import { NivelEntity } from '../../domain/entities/nivel.entity';

@Injectable({
  providedIn: 'root',
})
export class useNivel {
  niveles = signal<NivelEntity[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  constructor(private nivelUseCase: NivelUseCase) {}

  loadNiveles(): void {
    this.loading.set(true);
    this.error.set(null);

    this.nivelUseCase.getAllNiveles().subscribe({
      next: (niveles) => {
        this.niveles.set(niveles);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading niveles:', error);
        this.error.set('Error al cargar los niveles');
        this.loading.set(false);
      },
    });
  }

  getNivelById(id: number) {
    return this.nivelUseCase.getNivelById(id);
  }

  getNivelesOptions() {
    const niveles = this.niveles();
    
    // Buscar el nivel "general" y ponerlo primero como opción por defecto
    const generalNivel = niveles.find(nivel => nivel.nombre === 'general');
    const otrosNiveles = niveles.filter(nivel => nivel.nombre !== 'general');
    
    const options = [];
    
    // Agregar "general" primero si existe
    if (generalNivel) {
      options.push({
        label: generalNivel.displayName,
        value: generalNivel.nombre
      });
    }
    
    // Agregar el resto de niveles
    options.push(...otrosNiveles.map(nivel => ({
      label: nivel.displayName,
      value: nivel.nombre
    })));
    
    return options;
  }
}