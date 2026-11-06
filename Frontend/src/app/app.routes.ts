import { autenticacionGuard } from './guards/autenticacion-guard';
import { rolGuard } from './guards/rol-guard';
import { Routes } from '@angular/router';

// Componentes del grupo
import { AuthIniciarSesionComponent } from './components/auth-iniciar-sesion/auth-iniciar-sesion';
import { AuthRegistroComponent } from './components/auth-registro/auth-registro';
import { AdminListaMaquinasComponent } from './components/admin-lista-maquinas/admin-lista-maquinas';
import { AdminFormularioMaquinaComponent } from './components/admin-formulario-maquina/admin-formulario-maquina';

// Componentes del usuario Migue
import { UserHomeComponent } from './components/user-home/user-home';
import { UserPerfil } from './components/user-perfil/user-perfil';
import { UserQrunico } from './components/user-qrunico/user-qrunico';

import { UserMaquinadetComponent } from './components/user-maquinadet/user-maquinadet';

// Componentes de admin Sofia
import { AdminPanel } from './components/admin-panel/admin-panel';
import { AdminListaClientes } from './components/admin-lista-clientes/admin-lista-clientes';
import { AdminFormularioCliente } from './components/admin-formulario-cliente/admin-formulario-cliente';

const recoveryPage = () => import('./components/auth-recuperacion/auth-recuperacion').then(m => m.AuthRecuperacion);

export const routes: Routes = [
  { path: 'recuperar-contrasena', loadComponent: recoveryPage },
  { path: 'restablecer-contrasena', loadComponent: recoveryPage, data: { reset: true } },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    canActivate: [autenticacionGuard],
    component: AuthIniciarSesionComponent
  },
  {
    path: 'registro',
    component: AuthRegistroComponent
  },
  {
    path: 'admin/maquinas',
    canActivate: [rolGuard], data: { role: 'admin' },
    component: AdminListaMaquinasComponent
  },
  {
    path: 'admin/maquinas/nueva',
    canActivate: [rolGuard], data: { role: 'admin' },
    component: AdminFormularioMaquinaComponent
  },
  // path anterior de la lista de máquinas
  {
    path: 'admin-lista-maquinas',
    redirectTo: 'admin/maquinas',
    pathMatch: 'full'
  },

  // Módulo de usuario Migue
  { path: 'user-home', canActivate: [rolGuard], data: { role: 'member' }, component: UserHomeComponent },
  { path: 'user-perfil', canActivate: [rolGuard], data: { role: 'member' }, component: UserPerfil },
  { path: 'user-qrunico', canActivate: [rolGuard], data: { role: 'member' }, component: UserQrunico },
  { path: 'user-escaner', canActivate: [rolGuard], data: { role: 'member' }, loadComponent: () => import('./components/user-escaner/user-escaner').then(m => m.UserEscanerComponent) },
  { path: 'user-maquinadet', canActivate: [rolGuard], data: { role: 'member' }, component: UserMaquinadetComponent },

  // Módulo de admin Sofia
  { path: 'admin/dashboard', canActivate: [rolGuard], data: { role: 'admin' }, component: AdminPanel },
  { path: 'admin/clientes', canActivate: [rolGuard], data: { role: 'admin' }, component: AdminListaClientes },
  { path: 'admin/clientes/:id/editar', canActivate: [rolGuard], data: { role: 'admin' }, component: AdminFormularioCliente },
  { path: 'admin/escaner', canActivate: [rolGuard], data: { role: 'admin' }, loadComponent: () => import('./components/admin-escaner-acceso/admin-escaner-acceso').then(m => m.AdminEscanerAcceso) }
];