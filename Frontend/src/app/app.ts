import { Component } from '@angular/core';
//import { AdminPanel } from './components/admin-panel/admin-panel';

//@Component({
 // selector: 'app-root',
 // imports: [AdminPanel],
 // templateUrl: './app.html',
 // styleUrl: './app.css'
//})

//import { AdminListaClientes } from './components/admin-lista-clientes/admin-lista-clientes';

//@Component({
  //selector: 'app-root',
  //standalone: true,
  //imports: [AdminListaClientes], // antes tenías AdminPanel aquí
  //templateUrl: './app.html',
  //styleUrl: './app.css'
//})

//import { AdminFormularioCliente } from './components/admin-formulario-cliente/admin-formulario-cliente';

//@Component({
  //selector: 'app-root',
  //standalone: true,
  //imports: [AdminFormularioCliente], // cambia esto
  //templateUrl: './app.html',
  //styleUrl: './app.css'
//})


import { AdminEscanerAcceso } from './components/admin-escaner-acceso/admin-escaner-acceso';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [AdminEscanerAcceso], // cambia esto
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App { }
