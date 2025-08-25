import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  
  // Obtener el token del localStorage
  const token = localStorage.getItem('token');
  
  // URLs que no requieren autenticación
  const publicEndpoints = ['/auth/login', '/auth/register'];
  const isPublicEndpoint = publicEndpoints.some(endpoint => req.url.includes(endpoint));
  
  let authReq = req;
  
  // Si existe el token y no es un endpoint público, agregar el header Authorization
  if (token && !isPublicEndpoint) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
  
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si el token es inválido o expiró (401), redirigir al login
      if (error.status === 401 && !isPublicEndpoint) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.navigate(['/login']);
      }
      
      return throwError(() => error);
    })
  );
};