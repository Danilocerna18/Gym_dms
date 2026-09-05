import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

type ModoFormulario = 'nuevo' | 'editar'; //Definición del tipo ModoFormulario con dos posibles valores: 'nuevo' y 'editar'
type PlanMembresia = 'mensual' | 'anual'; //Definición del tipo PlanMembresia con dos posibles valores: 'mensual' y 'anual'

@Component({
  selector: 'app-admin-formulario-cliente',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-formulario-cliente.html',
  styleUrl: './admin-formulario-cliente.css'
})
export class AdminFormularioCliente {
  modo = signal<ModoFormulario>('nuevo'); // Inicialización de la señal modo con el valor 'nuevo'
  planSeleccionado = signal<PlanMembresia>('mensual'); // Inicialización de la señal planSeleccionado con el valor 'mensual'

  fechaVencimiento = computed(() => { //Calculando la fecha de vencimiento basada en el plan seleccionado
    const hoy = new Date(); //Obteniendo la fecha actual
    const fecha = this.planSeleccionado() === 'mensual'
      ? new Date(hoy.getFullYear(), hoy.getMonth() + 1, hoy.getDate()) //Si el plan seleccionado es 'mensual', se calcula la fecha de vencimiento sumando un mes a la fecha actual
      : new Date(hoy.getFullYear() + 1, hoy.getMonth(), hoy.getDate()); //Si el plan seleccionado es 'anual', se calcula la fecha de vencimiento sumando un año a la fecha actual

    const formato = fecha.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
    return `Vence el ${formato}`;
  });

  cambiarModo(nuevoModo: ModoFormulario) { //Método para cambiar el modo del formulario
    this.modo.set(nuevoModo); //Actualizando la señal modo con el nuevo valor
    if (nuevoModo === 'nuevo') {//Si el nuevo modo es 'nuevo', se establece el plan seleccionado a 'mensual'
      this.planSeleccionado.set('mensual'); //Restableciendo el plan seleccionado a 'mensual' cuando se cambia a modo 'nuevo'
    }
  }

  seleccionarPlan(plan: PlanMembresia) { //Método para seleccionar un plan de membresía
    this.planSeleccionado.set(plan);//Actualizando la señal planSeleccionado con el nuevo valor
  }
}