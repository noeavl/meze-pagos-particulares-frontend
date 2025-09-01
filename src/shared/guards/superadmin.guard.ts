import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivateFn } from '@angular/router';
import { useLogin } from '../../presentation/hooks/use-login.hook';

export const superadminGuard: CanActivateFn = async (route, state) => {
  const loginService = inject(useLogin);
  const router = inject(Router);

  let currentUser = loginService.user();
  
  if (!currentUser) {
    // Si no hay usuario en el hook, intentar cargar desde la API
    await loginService.checkCurrentUser();
    currentUser = loginService.user();
    
    if (!currentUser) {
      router.navigate(['/login']);
      return false;
    }
  }

  // Verificar si el usuario tiene rol de superadmin
  if (currentUser.role !== 'superadmin') {
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};