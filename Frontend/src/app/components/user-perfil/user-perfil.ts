import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-cliente-perfil',
  templateUrl: './cliente-perfil.component.html',
  styleUrls: ['./cliente-perfil.component.css'],
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'bg-chalk-50 text-iron-950 font-body-md min-h-screen flex flex-col md:flex-row pb-24 md:pb-0 block'
  }
})
export class ClientePerfilComponent {}