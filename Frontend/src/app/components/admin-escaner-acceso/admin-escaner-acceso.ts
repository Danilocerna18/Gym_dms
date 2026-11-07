import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { TimeoutError, switchMap, timeout, of } from 'rxjs';
import { Acceso, RespuestaValidacion } from '../../services/acceso';
import { AdminMenuPerfil } from '../admin-menu-perfil/admin-menu-perfil';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { BarcodeFormat } from '@zxing/library';

type ResultadoEscaneo = 'concedido' | 'denegado' | 'error';
type ModoAcceso = 'entry' | 'exit';

interface RegistroHistorial {
  nombre: string;
  iniciales: string;
  detalle: string;
  hora: string;
  exito: boolean;
}

const MENSAJE_SIN_CONEXION = 'Sin conexión. Intenta de nuevo.';
const TIEMPO_ESPERA_MS = 10000;
const DURACION_RESULTADO_MS = 2500;

@Component({
  selector: 'app-admin-escaner-acceso',
  standalone: true,
  imports: [CommonModule, RouterLink, AdminMenuPerfil, ZXingScannerModule],
  templateUrl: './admin-escaner-acceso.html',
  styleUrl: './admin-escaner-acceso.css'
})
export class AdminEscanerAcceso {
  private acceso = inject(Acceso);
  private temporizador?: ReturnType<typeof setTimeout>;

  allowedFormats = [BarcodeFormat.QR_CODE];
  scannerHabilitado = signal(true);

  resultadoVisible = signal(false);
  resultadoTipo = signal<ResultadoEscaneo>('concedido');
  resultadoMensaje = signal('');
  ingresoManualVisible = signal(false);
  modo = signal<ModoAcceso>('entry');
  resultadoEsSalida = signal(false);
  procesando = signal(false);

  ultimosAccesos = signal<RegistroHistorial[]>([]);

  onScanSuccess(qrResult?: string): void {
    if (!qrResult || !qrResult.trim() || this.procesando()) return;
    this.procesarCodigo(qrResult.trim());
  }

  procesarCodigo(qrCode: string) {
    const codigo = qrCode.trim();
    if (!codigo || this.procesando()) return;

    this.procesando.set(true);
    this.scannerHabilitado.set(false);
    const modo = this.modo();

    this.acceso.scan(codigo).pipe(
      switchMap(respuesta => {
        if (respuesta.type === 'membership') {
          return this.acceso.validateAccess(respuesta.userId, modo);
        }
        return of(null);
      }),
      timeout(TIEMPO_ESPERA_MS)
    ).subscribe({
      next: validacion => {
        this.procesando.set(false);
        if (validacion) {
          this.mostrarValidacion(validacion, modo, codigo);
        } else {
          this.reactivarScanner();
        }
      },
      error: err => {
        this.procesando.set(false);
        this.mostrarResultado('error', this.mensajeDeError(err), false);
        this.reactivarScanner();
      }
    });
  }

  cambiarModo(modo: ModoAcceso) {
    this.modo.set(modo);
  }

  enviarIngresoManual(input: HTMLInputElement) {
    this.procesarCodigo(input.value);
    input.value = '';
  }

  ingresoManual() {
    this.ingresoManualVisible.update(visible => !visible);
  }

  cerrarResultado() {
    clearTimeout(this.temporizador);
    this.resultadoVisible.set(false);
    this.reactivarScanner();
  }

  private mostrarValidacion(validacion: RespuestaValidacion, modo: ModoAcceso, codigoOriginal: string) {
    const tipo: ResultadoEscaneo = validacion.granted ? 'concedido' : validacion.result === 'no_entry' ? 'error' : 'denegado';
    const esSalida = validacion.granted && modo === 'exit';

    this.agregarAHistorial(codigoOriginal, validacion.granted, esSalida ? 'Salida' : 'Entrada');
    this.mostrarResultado(tipo, validacion.message, esSalida);
  }

  private mostrarResultado(tipo: ResultadoEscaneo, mensaje: string, esSalida: boolean) {
    clearTimeout(this.temporizador);
    this.resultadoTipo.set(tipo);
    this.resultadoMensaje.set(mensaje);
    this.resultadoEsSalida.set(esSalida);
    this.resultadoVisible.set(true);

    this.temporizador = setTimeout(() => {
      this.resultadoVisible.set(false);
      this.reactivarScanner();
    }, DURACION_RESULTADO_MS);
  }

  private agregarAHistorial(codigo: string, exito: boolean, modoTexto: string) {
    const hora = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const nuevoRegistro: RegistroHistorial = {
      nombre: `Usuario (${codigo.slice(0, 8)})`,
      iniciales: codigo.slice(0, 2).toUpperCase(),
      detalle: `${modoTexto} - ${exito ? 'Concedido' : 'Rechazado'}`,
      hora: hora,
      exito: exito
    };

    this.ultimosAccesos.update(lista => [nuevoRegistro, ...lista.slice(0, 4)]);
  }

  private reactivarScanner() {
    setTimeout(() => {
      this.scannerHabilitado.set(true);
    }, 500);
  }

  private mensajeDeError(err: unknown): string {
    if (err instanceof TimeoutError) return MENSAJE_SIN_CONEXION;
    if (err instanceof HttpErrorResponse && err.status !== 0 && err.error?.message) return err.error.message;
    return MENSAJE_SIN_CONEXION;
  }
}