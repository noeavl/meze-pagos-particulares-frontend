import { Routes } from '@angular/router';
import { LoginComponent } from '../presentation/components/login/login';
import { DashboardComponent } from '../presentation/pages/dashboard/dashboard';
import { authGuard, loginGuard } from '../shared/guards/auth.guard';
import { Usuarios } from '../presentation/pages/usuarios/usuarios';
import { Estudiantes } from '../presentation/pages/estudiantes/estudiantes';
import { EstudianteCreate } from '../presentation/pages/estudiante-create/estudiante-create';
import { EstudianteEdit } from '../presentation/pages/estudiante-edit/estudiante-edit';
import { PagosAdeudos } from '../presentation/pages/pagos-adeudos/pagos-adeudos';
import { PagosRequeridos } from '../presentation/pages/pagos-requeridos/pagos-requeridos';
import { MainLayout } from '../presentation/layouts/main-layout/main-layout';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [loginGuard],
  },
  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent,
      },
      {
        path: 'usuarios',
        component: Usuarios,
      },
      {
        path: 'estudiantes',
        component: Estudiantes,
      },
      {
        path: 'estudiante/create',
        component: EstudianteCreate,
      },
      {
        path: 'estudiante/edit/:id',
        component: EstudianteEdit,
      },
      {
        path: 'pagos-adeudos',
        component: PagosAdeudos,
      },
      {
        path: 'pagos-requeridos',
        component: PagosRequeridos,
      },
    ],
  },
  { path: '**', redirectTo: '/login' },
];
