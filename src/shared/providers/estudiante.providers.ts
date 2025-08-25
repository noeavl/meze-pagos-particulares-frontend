import { Provider } from '@angular/core';
import { ESTUDIANTE_REPOSITORY } from '../../domain/repositories/estudiante.repository';
import { EstudianteService } from '../../infrastructure/api/estudiante.service';

export const estudianteProviders: Provider[] = [
  {
    provide: ESTUDIANTE_REPOSITORY,
    useClass: EstudianteService
  }
];