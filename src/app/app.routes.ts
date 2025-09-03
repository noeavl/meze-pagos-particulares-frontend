import { Routes } from "@angular/router";
import { LoginComponent } from "../presentation/components/login/login";
import { DashboardComponent } from "../presentation/pages/dashboard/dashboard";
import { authGuard, loginGuard } from "../shared/guards/auth.guard";
import { superadminGuard } from "../shared/guards/superadmin.guard";
import { Usuarios } from "../presentation/pages/usuarios/usuarios";
import { UsuarioCreate } from "../presentation/pages/usuario-create/usuario-create";
import { UsuarioEdit } from "../presentation/pages/usuario-edit/usuario-edit";
import { Estudiantes } from "../presentation/pages/estudiantes/estudiantes";
import { EstudianteCreate } from "../presentation/pages/estudiante-create/estudiante-create";
import { EstudianteEdit } from "../presentation/pages/estudiante-edit/estudiante-edit";
import { EstudianteDetailComponent } from "../presentation/pages/estudiante-detail/estudiante-detail";
import { Conceptos } from "../presentation/pages/conceptos/conceptos";
import { ConceptoCreate } from "../presentation/pages/concepto-create/concepto-create";
import { ConceptoEdit } from "../presentation/pages/concepto-edit/concepto-edit";
import { ConceptoDetailComponent } from "../presentation/pages/concepto-detail/concepto-detail";
import { MainLayout } from "../presentation/layouts/main-layout/main-layout";
import { Adeudos } from "../presentation/pages/adeudos/adeudos";
import { PagosEdit } from "../presentation/pages/pagos-edit/pagos-edit";
import { Pagos } from "../presentation/pages/pagos/pagos";
import { PagosCreate } from "../presentation/pages/pagos-create/pagos-create";
import { PagosDetail } from "../presentation/pages/pagos-detail/pagos-detail";
import { PagosRequeridosCreate } from "../presentation/pages/pagos-requeridos-create/pagos-requeridos-create";
import { AdeudosCreate } from "../presentation/pages/adeudos-create/adeudos-create";
import { AdeudoDetail } from "../presentation/pages/adeudo-detail/adeudo-detail";
import { CiclosEscolares } from "../presentation/pages/ciclos-escolares/ciclos-escolares";
import { CicloEscolarCreate } from "../presentation/pages/ciclo-escolar-create/ciclo-escolar-create";
import { CicloEscolarEdit } from "../presentation/pages/ciclo-escolar-edit/ciclo-escolar-edit";

export const routes: Routes = [
  { path: "", redirectTo: "/dashboard", pathMatch: "full" },
  {
    path: "login",
    component: LoginComponent,
    canActivate: [loginGuard],
  },
  {
    path: "",
    component: MainLayout,
    canActivate: [authGuard],
    children: [
      {
        path: "dashboard",
        component: DashboardComponent,
      },
      {
        path: "usuarios",
        component: Usuarios,
        canActivate: [superadminGuard],
      },
      {
        path: "usuario/create",
        component: UsuarioCreate,
        canActivate: [superadminGuard],
      },
      {
        path: "usuario/edit/:id",
        component: UsuarioEdit,
        canActivate: [superadminGuard],
      },
      {
        path: "estudiantes",
        component: Estudiantes,
      },
      {
        path: "estudiante/create",
        component: EstudianteCreate,
      },
      {
        path: "estudiante/edit/:id",
        component: EstudianteEdit,
      },
      {
        path: "estudiante/detail/:id",
        component: EstudianteDetailComponent,
      },
      {
        path: "conceptos",
        component: Conceptos,
      },
      {
        path: "concepto/create",
        component: ConceptoCreate,
      },
      {
        path: "concepto/edit/:id",
        component: ConceptoEdit,
      },
      {
        path: "concepto/detail/:id",
        component: ConceptoDetailComponent,
      },
      {
        path: "adeudos",
        component: Adeudos,
      },
      {
        path: "adeudos/create",
        component: AdeudosCreate,
      },
      {
        path: "adeudos/detail/:id",
        component: AdeudoDetail,
      },
      {
        path: "pagos",
        component: Pagos,
      },
      {
        path: "pagos/create/:id",
        component: PagosCreate,
      },
      {
        path: "pagos/requeridos/create",
        component: PagosRequeridosCreate,
      },
      {
        path: "pagos/edit/:id",
        component: PagosEdit,
      },
      {
        path: "pagos/detail/:id",
        component: PagosDetail,
      },
      {
        path: "ciclos-escolares",
        component: CiclosEscolares,
      },
      {
        path: "ciclo-escolar/create",
        component: CicloEscolarCreate,
      },
      {
        path: "ciclo-escolar/edit/:id",
        component: CicloEscolarEdit,
      },
    ],
  },
  { path: "**", redirectTo: "/login" },
];
