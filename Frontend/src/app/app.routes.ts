//import { Routes } from '@angular/router';

//export const routes: Routes = [];

import { Routes } from '@angular/router';
import { AuthIniciarSesionComponent } from './components/auth-iniciar-sesion/auth-iniciar-sesion';
import { AuthRegistroComponent } from './components/auth-registro/auth-registro';

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
  }
];