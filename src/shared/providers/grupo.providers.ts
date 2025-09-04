import { Provider } from '@angular/core';
import { GrupoRepository } from '../../domain/repositories/grupo.repository';
import { GrupoService } from '../../infrastructure/api/grupo.service';
import { GrupoUseCase } from '../../domain/use-cases/grupo.use-case';

export const grupoProviders: Provider[] = [
  { provide: GrupoRepository, useClass: GrupoService },
  GrupoUseCase,
];
