import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthIniciarSesionComponent } from './auth-iniciar-sesion';

describe('AuthIniciarSesionComponent', () => {
  let component: AuthIniciarSesionComponent;
  let fixture: ComponentFixture<AuthIniciarSesionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthIniciarSesionComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();

    fixture = TestBed.createComponent(AuthIniciarSesionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería iniciar con la contraseña oculta', () => {
    expect(component.mostrarPassword).toBe(false);
  });

  it('debería permitir cambiar la visibilidad de la contraseña', () => {
    component.mostrarPassword = false;
    component.mostrarPassword = true;
    expect(component.mostrarPassword).toBe(true);
  });

  it('debería guardar el correo', () => {
    component.email = 'atleta@ejemplo.com';
    expect(component.email).toBe('atleta@ejemplo.com');
  });

  it('debería guardar la contraseña', () => {
    component.password = '12345678';
    expect(component.password).toBe('12345678');
  });

  it('debería redirigir al backend para login con Google', () => {
    expect(fixture.nativeElement.querySelector('.google-button').href)
      .toBe('http://localhost:3000/api/auth/google');
  });

  it.each([['admin', '/admin/dashboard'], ['member', '/user-home']])(
    'redirige al rol %s confirmado por el servidor', (role, home) => {
      const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
      component.email = 'miembro@example.com';
      component.password = 'clave de prueba';
      component.iniciarSesion();
      component.iniciarSesion();
      const req = TestBed.inject(HttpTestingController).expectOne('http://localhost:3000/api/auth/login');
      expect(req.request.withCredentials).toBe(true);
      expect(req.request.body).toEqual({ email: component.email, password: component.password });
      req.flush({ user: { role } });
      expect(navigate).toHaveBeenCalledWith(home);
    }
  );
});
