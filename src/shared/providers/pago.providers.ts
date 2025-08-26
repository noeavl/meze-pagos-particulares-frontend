import { Provider } from '@angular/core';
import { PagoRepository } from '../../domain/repositories/pago.repository';
import { PagoService } from '../../infrastructure/api/pago.service';
import { PagoUseCase } from '../../domain/use-cases/pago.use-case';
import { usePago } from '../../presentation/hooks/use-pago.hook';

export const pagoProviders: Provider[] = [
  { provide: PagoRepository, useClass: PagoService },
  PagoUseCase,
  usePago,
];