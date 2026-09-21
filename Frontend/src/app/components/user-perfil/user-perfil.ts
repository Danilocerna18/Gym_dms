import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-user-perfil',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './user-perfil.html',
  styleUrl: './user-perfil.css'
})
export class UserPerfil {}