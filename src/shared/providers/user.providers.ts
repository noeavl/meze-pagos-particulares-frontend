import { UserRepository } from '../../domain/repositories/user.repository';
import { UserService } from '../../infrastructure/api/user.service';
import { UserUseCase } from '../../domain/use-cases/user.use-case';

export const userProviders = [
  {
    provide: UserRepository,
    useClass: UserService,
  },
  UserUseCase,
];