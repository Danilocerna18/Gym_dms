import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { Acceso } from '../../services/acceso';

import { AdminEscanerAcceso } from './admin-escaner-acceso';

describe('AdminEscanerAcceso', () => {
  let component: AdminEscanerAcceso;
  let fixture: ComponentFixture<AdminEscanerAcceso>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminEscanerAcceso],
      providers: [provideHttpClient()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminEscanerAcceso);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('usa el modo Entrada por defecto', () => {
    expect(component.modo()).toBe('entry');
  });

  it('envía el modo elegido a validateAccess', () => {
    const acceso = TestBed.inject(Acceso);
    vi.spyOn(acceso, 'scan').mockReturnValue(of({ type: 'membership', userId: 'u1' }));
    const validar = vi.spyOn(acceso, 'validateAccess').mockReturnValue(
      of({ granted: true, result: 'granted', message: 'Salida registrada' })
    );

    component.cambiarModo('exit');
    component.procesarCodigo('codigo');

    expect(validar).toHaveBeenCalledWith('u1', '000', 'exit');
    expect(component.resultadoEsSalida()).toBe(true);
  });

  it('muestra no_entry como aviso gris, no como denegado', () => {
    const acceso = TestBed.inject(Acceso);
    vi.spyOn(acceso, 'scan').mockReturnValue(of({ type: 'membership', userId: 'u1' }));
    vi.spyOn(acceso, 'validateAccess').mockReturnValue(
      of({ granted: false, result: 'no_entry', message: 'Este código no tiene una entrada registrada.' })
    );

    component.cambiarModo('exit');
    component.procesarCodigo('codigo');

    expect(component.resultadoTipo()).toBe('error');
    expect(component.resultadoEsSalida()).toBe(false);
  });
});
