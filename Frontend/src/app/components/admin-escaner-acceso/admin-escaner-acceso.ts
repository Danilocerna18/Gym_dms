import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { TimeoutError, switchMap, timeout, of } from 'rxjs';
import { Acceso, RespuestaValidacion } from '../../services/acceso';

type ResultadoEscaneo = 'concedido' | 'denegado' | 'error'; // tipo de resultado que puede mostrar el escáner
type ModoAcceso = 'entry' | 'exit'; // lo elige el recepcionista antes de escanear

const MENSAJE_SIN_CONEXION = 'Sin conexión. Intenta de nuevo.';
const TIEMPO_ESPERA_MS = 10000; // si el backend no responde en este tiempo se trata como sin conexión
const DURACION_RESULTADO_MS = 2500; // auto-dismiss 2-3 segundos

@Component({
  selector: 'app-admin-escaner-acceso',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-escaner-acceso.html',
  styleUrl: './admin-escaner-acceso.css'
})
export class AdminEscanerAcceso {
  private acceso = inject(Acceso);
  private temporizador?: ReturnType<typeof setTimeout>;

  resultadoVisible = signal(false); // indica si se está mostrando un resultado de escaneo
  resultadoTipo = signal<ResultadoEscaneo>('concedido'); // indica el tipo de resultado que se está mostrando
  resultadoMensaje = signal(''); // mensaje que devuelve el backend, se muestra como subtítulo
  ingresoManualVisible = signal(false); // indica si se muestra el input de ingreso manual
  modo = signal<ModoAcceso>('entry'); // por defecto Entrada, el modo actual siempre se muestra en pantalla
  resultadoEsSalida = signal(false); // distingue "Salida Registrada" de "Acceso Concedido" en el título
  procesando = signal(false); // evita enviar otro código mientras hay una petición en curso

  procesarCodigo(qrCode: string) { // único punto de entrada del escáner (hoy ingreso manual, luego la cámara)
    const codigo = qrCode.trim();
    if (!codigo || this.procesando()) return;

    this.procesando.set(true);
    const modo = this.modo(); // se fija al enviar, para que cambiarlo a media petición no altere este escaneo

    this.acceso.scan(codigo).pipe(
      switchMap(respuesta => {
        if (respuesta.type === 'membership') {
          // reemplazar por el id de sesión del admin autenticado cuando Danilo termine el Google Sign-In
          return this.acceso.validateAccess(respuesta.userId, '000', modo);
        }

        // conectar con el flujo de video de la máquina cuando esté listo
        console.log('QR de máquina escaneado:', respuesta.machineId);
        return of(null);
      }),
      timeout(TIEMPO_ESPERA_MS)
    ).subscribe({
      next: validacion => {
        this.procesando.set(false);
        if (validacion) this.mostrarValidacion(validacion, modo);
      },
      error: err => {
        this.procesando.set(false);
        this.mostrarResultado('error', this.mensajeDeError(err), false);
      }
    });
  }

  cambiarModo(modo: ModoAcceso) { // selector Entrada / Salida
    this.modo.set(modo);
  }

  enviarIngresoManual(input: HTMLInputElement) { // envía el código escrito en el input de ingreso manual
    this.procesarCodigo(input.value);
    input.value = '';
  }

  ingresoManual() { // muestra u oculta el input de ingreso manual
    this.ingresoManualVisible.update(visible => !visible);
  }

  cerrarResultado() { // cierre manual del cuadro de resultado, si el usuario hace click en la X antes de que se cierre solo
    clearTimeout(this.temporizador);
    this.resultadoVisible.set(false);
  }

  private mostrarValidacion(validacion: RespuestaValidacion, modo: ModoAcceso) { // mapea la respuesta de validateAccess al cuadro
    // "no_entry" no es un rechazo de acceso sino un aviso (salida sin entrada), por eso va en gris y no en rojo
    const tipo: ResultadoEscaneo = validacion.granted ? 'concedido' : validacion.result === 'no_entry' ? 'error' : 'denegado';
    this.mostrarResultado(tipo, validacion.message, validacion.granted && modo === 'exit');
  }

  private mostrarResultado(tipo: ResultadoEscaneo, mensaje: string, esSalida: boolean) { // muestra el cuadro de resultado y lo oculta tras 2.5 segundos
    clearTimeout(this.temporizador);
    this.resultadoTipo.set(tipo);
    this.resultadoMensaje.set(mensaje);
    this.resultadoEsSalida.set(esSalida);
    this.resultadoVisible.set(true);

    this.temporizador = setTimeout(() => this.resultadoVisible.set(false), DURACION_RESULTADO_MS);
  }

  private mensajeDeError(err: unknown): string { // nunca muestra el error técnico crudo
    if (err instanceof TimeoutError) return MENSAJE_SIN_CONEXION;
    // 404/429/400/500 del backend ya traen un message pensado para el usuario; status 0 = backend caído
    if (err instanceof HttpErrorResponse && err.status !== 0 && err.error?.message) return err.error.message;
    return MENSAJE_SIN_CONEXION;
  }
}
