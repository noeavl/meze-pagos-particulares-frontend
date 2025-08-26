import { AdeudoRepository } from '../../domain/repositories/adeudo.repository';
import { AdeudoService } from '../../infrastructure/api/adeudo.service';

export const adeudoProviders = [
  {
    provide: AdeudoRepository,
    useClass: AdeudoService,
  },
];