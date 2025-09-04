import { Provider } from '@angular/core';
import { NivelRepository } from '../../domain/repositories/nivel.repository';
import { NivelService } from '../../infrastructure/api/nivel.service';

export const NIVEL_PROVIDERS: Provider[] = [
  {
    provide: NivelRepository,
    useClass: NivelService,
  },
];