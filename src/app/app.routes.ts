import { Routes } from '@angular/router';
import { LoginComponent } from '../presentation/components/login/login';
import { DashboardComponent } from '../presentation/pages/dashboard/dashboard';
import { authGuard, loginGuard } from '../shared/guards/auth.guard';
import { Usuarios } from '../presentation/pages/usuarios/usuarios';
import { Estudiantes } from '../presentation/pages/estudiantes/estudiantes';
import { EstudianteCreate } from '../presentation/pages/estudiante-create/estudiante-create';
import { EstudianteEdit } from '../presentation/pages/estudiante-edit/estudiante-edit';
import { EstudianteDetailComponent } from '../presentation/pages/estudiante-detail/estudiante-detail';
import { Conceptos } from '../presentation/pages/conceptos/conceptos';
import { ConceptoCreate } from '../presentation/pages/concepto-create/concepto-create';
import { ConceptoEdit } from '../presentation/pages/concepto-edit/concepto-edit';
import { ConceptoDetailComponent } from '../presentation/pages/concepto-detail/concepto-detail';
import { MainLayout } from '../presentation/layouts/main-layout/main-layout';
import { Adeudos } from '../presentation/pages/adeudos/adeudos';
import { PagosAdeudosEdit } from '../presentation/pages/pagos-adeudos-edit/pagos-adeudos-edit';
import { PagosAdeudos } from '../presentation/pages/pagos-adeudos/pagos-adeudos';
import { PagosAdeudosCreate } from '../presentation/pages/pagos-adeudos-create/pagos-adeudos-create';
import { PagosAdeudosDetail } from '../presentation/pages/pagos-adeudos-detail/pagos-adeudos-detail';
import { PagosRequeridos } from '../presentation/pages/pagos-requeridos/pagos-requeridos';
import { AdeudosCreate } from '../presentation/pages/adeudos-create/adeudos-create';
import { AdeudoDetail } from '../presentation/pages/adeudo-detail/adeudo-detail';

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
        path: 'estudiante/detail/:id',
        component: EstudianteDetailComponent,
      },
      {
        path: 'conceptos',
        component: Conceptos,
      },
      {
        path: 'concepto/create',
        component: ConceptoCreate,
      },
      {
        path: 'concepto/edit/:id',
        component: ConceptoEdit,
      },
      {
        path: 'concepto/detail/:id',
        component: ConceptoDetailComponent,
      },
      {
        path: 'pagos/requeridos',
        component: PagosRequeridos,
      },
      {
        path: 'adeudos',
        component: Adeudos,
      },
      {
        path: 'adeudos/create',
        component: AdeudosCreate,
      },
      {
        path: 'adeudos/detail/:id',
        component: AdeudoDetail,
      },
      {
        path: 'pagos/adeudos',
        component: PagosAdeudos,
      },
      {
        path: 'pagos/adeudos/create/:id',
        component: PagosAdeudosCreate,
      },
      {
        path: 'pagos/adeudos/edit/:id',
        component: PagosAdeudosEdit,
      },
      {
        path: 'pagos/adeudos/detail/:id',
        component: PagosAdeudosDetail,
      },
    ],
  },
  { path: '**', redirectTo: '/login' },
];
