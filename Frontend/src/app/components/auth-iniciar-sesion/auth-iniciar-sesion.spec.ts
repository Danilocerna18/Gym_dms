import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthIniciarSesionComponent } from './auth-iniciar-sesion';

describe('AuthIniciarSesionComponent', () => {
  let component: AuthIniciarSesionComponent;
  let fixture: ComponentFixture<AuthIniciarSesionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthIniciarSesionComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(AuthIniciarSesionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería iniciar con la contraseña oculta', () => {
    expect(component.mostrarPassword).toBeFalse();
  });

  it('debería permitir cambiar la visibilidad de la contraseña', () => {
    component.mostrarPassword = false;
    component.mostrarPassword = true;
    expect(component.mostrarPassword).toBeTrue();
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
    spyOnProperty(window, 'location', 'get').and.returnValue({ href: '' } as any);
    spyOnProperty(window, 'location', 'set').and.callFake((val: string) => {
      (window as any)._href = val;
    });

    component.loginWithGoogle();

    expect((window as any)._href).toBe('http://localhost:3000/api/auth/google');
  });
});
