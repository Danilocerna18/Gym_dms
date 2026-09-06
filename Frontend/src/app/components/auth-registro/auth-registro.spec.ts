import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthRegistroComponent } from './auth-registro';

describe('AuthRegistroComponent', () => {
  let component: AuthRegistroComponent;
  let fixture: ComponentFixture<AuthRegistroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthRegistroComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(AuthRegistroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería iniciar con el plan mensual', () => {
    expect(component.plan).toBe('mensual');
  });

  it('debería seleccionar el plan anual', () => {
    component.seleccionarPlan('anual');

    expect(component.plan).toBe('anual');
  });

  it('debería seleccionar el plan mensual', () => {
    component.seleccionarPlan('mensual');

    expect(component.plan).toBe('mensual');
  });

  it('debería guardar el nombre', () => {
    component.nombre = 'Carlos Rivera';

    expect(component.nombre).toBe('Carlos Rivera');
  });

  it('debería guardar el correo', () => {
    component.email = 'carlos@ejemplo.com';

    expect(component.email).toBe('carlos@ejemplo.com');
  });

  it('debería guardar el teléfono', () => {
    component.telefono = '50200000000';

    expect(component.telefono).toBe('50200000000');
  });

  it('debería guardar la contraseña', () => {
    component.password = '12345678';

    expect(component.password).toBe('12345678');
  });

  it('debería cambiar la visibilidad de la contraseña', () => {
    component.mostrarPassword = false;

    component.mostrarPassword = true;

    expect(component.mostrarPassword).toBeTrue();
  });

  it('debería indicar que la cuenta fue creada', () => {
    component.nombre = 'Carlos Rivera';
    component.email = 'carlos@ejemplo.com';
    component.password = '12345678';

    component.crearCuenta();

    expect(component.cuentaCreada).toBeTrue();
  });
});