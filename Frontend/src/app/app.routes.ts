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
import { UserEscanerComponent } from './components/user-escaner/user-escaner';
import { UserMaquinadetComponent } from './components/user-maquinadet/user-maquinadet';

// Componentes de admin Sofia
import { AdminPanel } from './components/admin-panel/admin-panel';
import { AdminListaClientes } from './components/admin-lista-clientes/admin-lista-clientes';
import { AdminFormularioCliente } from './components/admin-formulario-cliente/admin-formulario-cliente';
import { AdminEscanerAcceso } from './components/admin-escaner-acceso/admin-escaner-acceso';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: AuthIniciarSesionComponent
  },
  {
    path: 'registro',
    component: AuthRegistroComponent
  },
  {
    path: 'admin/maquinas',
    component: AdminListaMaquinasComponent
  },
  {
    path: 'admin/maquinas/nueva',
    component: AdminFormularioMaquinaComponent
  },
  // path anterior de la lista de máquinas
  {
    path: 'admin-lista-maquinas',
    redirectTo: 'admin/maquinas',
    pathMatch: 'full'
  },

  // Módulo de usuario Migue
  { path: 'user-home', component: UserHomeComponent },
  { path: 'user-perfil', component: UserPerfil },
  { path: 'user-qrunico', component: UserQrunico },
  { path: 'user-escaner', component: UserEscanerComponent },
  { path: 'user-maquinadet', component: UserMaquinadetComponent },

  // Módulo de admin Sofia
  { path: 'admin/dashboard', component: AdminPanel },
  { path: 'admin/clientes', component: AdminListaClientes },
  { path: 'admin/clientes/nuevo', component: AdminFormularioCliente },
  { path: 'admin/clientes/:id/editar', component: AdminFormularioCliente },
  { path: 'admin/escaner', component: AdminEscanerAcceso }
];