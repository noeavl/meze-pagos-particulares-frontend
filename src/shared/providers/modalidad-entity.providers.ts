import { Provider } from '@angular/core';
import { ModalidadEntityRepository } from '../../domain/repositories/modalidad-entity.repository';
import { ModalidadEntityService } from '../../infrastructure/api/modalidad-entity.service';

export const MODALIDAD_PROVIDERS: Provider[] = [
  {
    provide: ModalidadEntityRepository,
    useClass: ModalidadEntityService,
  },
];