//import { Routes } from '@angular/router';

//export const routes: Routes = [];

import { Routes } from '@angular/router';

import { AuthIniciarSesionComponent } from './components/auth-iniciar-sesion/auth-iniciar-sesion';
import { AuthRegistroComponent } from './components/auth-registro/auth-registro';

import { AdminListaMaquinasComponent } from './components/admin-lista-maquinas/admin-lista-maquinas';
import { AdminFormularioMaquinaComponent } from './components/admin-formulario-maquina/admin-formulario-maquina';

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
  }

];