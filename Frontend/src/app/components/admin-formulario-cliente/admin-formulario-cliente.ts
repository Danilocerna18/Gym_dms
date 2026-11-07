import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AdminMenuPerfil } from '../admin-menu-perfil/admin-menu-perfil';

// Solo edición: el admin ya no crea miembros ni asigna planes (PRD decisión 11).
// Pendiente: todavía no existe endpoint para cargar ni guardar los datos del
// cliente, así que el formulario no envía nada.
@Component({
  selector: 'app-admin-formulario-cliente',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, AdminMenuPerfil],
  templateUrl: './admin-formulario-cliente.html',
  styleUrl: './admin-formulario-cliente.css'
})
export class AdminFormularioCliente {}
