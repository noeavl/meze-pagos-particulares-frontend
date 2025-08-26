import { ConceptoRepository } from '../../domain/repositories/concepto.repository';
import { ConceptoService } from '../../infrastructure/api/concepto.service';

export const conceptoProviders = [
  {
    provide: ConceptoRepository,
    useClass: ConceptoService,
  },
];