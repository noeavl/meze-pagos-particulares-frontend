import { Provider } from '@angular/core';
import { GradoRepository } from '../../domain/repositories/grado.repository';
import { GradoService } from '../../infrastructure/api/grado.service';

export const GRADO_PROVIDERS: Provider[] = [
  {
    provide: GradoRepository,
    useClass: GradoService,
  },
];