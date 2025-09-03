import { CicloEscolarRepository } from '../../domain/repositories/ciclo-escolar.repository';
import { CicloEscolarService } from '../../infrastructure/api/ciclo-escolar.service';

export const cicloEscolarProviders = [
  {
    provide: CicloEscolarRepository,
    useClass: CicloEscolarService,
  },
];