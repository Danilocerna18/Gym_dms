import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-user-escaner',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './user-escaner.html',
  styleUrl: './user-escaner.css'
})
export class UserEscaner implements OnInit {

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Simula lectura de QR y redirige a la máquina detectada tras 3.5s
    setTimeout(() => {
      this.router.navigate(['/user-maquinadet']);
    }, 3500);
  }
}