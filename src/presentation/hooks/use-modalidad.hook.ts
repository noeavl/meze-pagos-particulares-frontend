import { Injectable, signal } from '@angular/core';
import { ModalidadEntityUseCase } from '../../domain/use-cases/modalidad-entity.use-case';
import { ModalidadEntity } from '../../domain/entities/modalidad-entity.entity';

@Injectable({
  providedIn: 'root',
})
export class useModalidad {
  modalidades = signal<ModalidadEntity[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  constructor(private modalidadUseCase: ModalidadEntityUseCase) {}

  loadModalidades(): void {
    this.loading.set(true);
    this.error.set(null);

    this.modalidadUseCase.getAllModalidades().subscribe({
      next: (modalidades) => {
        this.modalidades.set(modalidades);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading modalidades:', error);
        this.error.set('Error al cargar las modalidades');
        this.loading.set(false);
      },
    });
  }

  getModalidadById(id: number) {
    return this.modalidadUseCase.getModalidadById(id);
  }

  getModalidadesOptions() {
    const modalidades = this.modalidades();
    
    // Buscar la modalidad "general" y ponerla primero como opción por defecto
    const generalModalidad = modalidades.find(modalidad => modalidad.nombre === 'general');
    const otrasModalidades = modalidades.filter(modalidad => modalidad.nombre !== 'general');
    
    const options = [];
    
    // Agregar "general" primero si existe
    if (generalModalidad) {
      options.push({
        label: generalModalidad.displayName,
        value: generalModalidad.nombre
      });
    }
    
    // Agregar el resto de modalidades
    options.push(...otrasModalidades.map(modalidad => ({
      label: modalidad.displayName,
      value: modalidad.nombre
    })));
    
    return options;
  }
}