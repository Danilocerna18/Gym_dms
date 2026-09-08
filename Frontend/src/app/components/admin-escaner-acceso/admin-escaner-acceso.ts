import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

type ResultadoEscaneo = 'concedido' | 'denegado'; // tipo de resultado que puede mostrar el escáner

@Component({
  selector: 'app-admin-escaner-acceso',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-escaner-acceso.html',
  styleUrl: './admin-escaner-acceso.css'
})
export class AdminEscanerAcceso {
  resultadoVisible = signal(false); // indica si se está mostrando un resultado de escaneo
  resultadoTipo = signal<ResultadoEscaneo>('concedido'); // indica el tipo de resultado que se está mostrando

  simularEscaneo(tipo: ResultadoEscaneo = 'concedido') { // simula un escaneo de acceso, mostrando el resultado por 2.5 segundos
    if (this.resultadoVisible()) return; // evita disparar otro mientras uno ya se muestra

    this.resultadoTipo.set(tipo); // establece el tipo de resultado a mostrar
    this.resultadoVisible.set(true); // muestra el resultado

    setTimeout(() => { // oculta el resultado después de 2.5 segundos
      this.resultadoVisible.set(false); // oculta el resultado
    }, 2500);
  }

  ingresoManual() { // simula el ingreso manual de un miembro, mostrando un mensaje en la consola
    //abrir flujo de búsqueda manual de miembro cuando se conecte al backend
    console.log('Ingreso manual solicitado');
  }
}