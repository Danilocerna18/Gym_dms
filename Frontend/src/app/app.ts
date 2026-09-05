import { Component } from '@angular/core';
import { AdminPanel } from './components/admin-panel/admin-panel';

@Component({
  selector: 'app-root',
  imports: [AdminPanel],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App { }
