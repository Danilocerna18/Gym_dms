import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-user-maquinadet',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './user-maquinadet.html',
  styleUrl: './user-maquinadet.css'
})
export class UserMaquinadet {}