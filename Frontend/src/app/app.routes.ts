import { Routes } from '@angular/router';

// Componentes del grupo
import { AuthIniciarSesionComponent } from './components/auth-iniciar-sesion/auth-iniciar-sesion';
import { AuthRegistroComponent } from './components/auth-registro/auth-registro';
import { AdminListaMaquinasComponent } from './components/admin-lista-maquinas/admin-lista-maquinas';
import { AdminFormularioMaquinaComponent } from './components/admin-formulario-maquina/admin-formulario-maquina';

// Componentes del usuario Migue
import { UserHome } from './components/user-home/user-home';
import { UserPerfil } from './components/user-perfil/user-perfil';
import { UserQrunico } from './components/user-qrunico/user-qrunico';
import { UserEscaner } from './components/user-escaner/user-escaner';
import { UserMaquinadet } from './components/user-maquinadet/user-maquinadet';

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
    path: 'admin-lista-maquinas',
    component: AdminListaMaquinasComponent
  },
  {
    path: 'admin-formulario-maquina',
    component: AdminFormularioMaquinaComponent
  },

  // Módulo de usuario Migue
  { path: 'user-home', component: UserHome },
  { path: 'user-perfil', component: UserPerfil },
  { path: 'user-qrunico', component: UserQrunico },
  { path: 'user-escaner', component: UserEscaner },
  { path: 'user-maquinadet', component: UserMaquinadet }
];