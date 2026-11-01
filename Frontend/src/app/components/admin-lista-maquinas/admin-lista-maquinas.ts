import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminMenuPerfil } from '../admin-menu-perfil/admin-menu-perfil';

@Component({
  selector: 'app-admin-lista-maquinas',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    RouterLinkActive, AdminMenuPerfil
  ],
  templateUrl: './admin-lista-maquinas.html',
  styleUrl: './admin-lista-maquinas.css'
})
export class AdminListaMaquinasComponent {

  busqueda = '';

  filtroActual = 'todas';

  constructor(private router: Router) {}

  nuevaMaquina() {
    this.router.navigate(['/admin-formulario-maquina']);
  }

  regresar() {
    this.router.navigate(['/login']);
  }

  seleccionarFiltro(filtro: string) {
    this.filtroActual = filtro;
  }
}