import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../infrastructure/api/auth.service';

export const authGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = await authService.getCurrentUser();
  
  if (!user) {
    router.navigate(['/login']);
    return false;
  }
  
  return true;
};

export const loginGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = await authService.getCurrentUser();
  
  if (user) {
    router.navigate(['/dashboard']);
    return false;
  }
  
  return true;
};