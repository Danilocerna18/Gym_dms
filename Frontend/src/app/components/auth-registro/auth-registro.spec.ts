
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { HttpErrorResponse } from "@angular/common/http";

import { AuthRegistroComponent } from "./auth-registro";
import { RegistroService } from "../../services/registro.service";

describe("AuthRegistroComponent", () => {
  let component: AuthRegistroComponent;
  let fixture: ComponentFixture<AuthRegistroComponent>;
  let registroService: jasmine.SpyObj<RegistroService>;

  const respuestaPrueba = {
    ok: true,
    message: "Tu cuenta fue creada correctamente.",
    user: {
      id: "usuario-prueba",
      name: "Carlos Rivera",
      email: "carlos@ejemplo.com",
      role: "member",
      qrCode: "USER-123",
      createdAt: new Date().toISOString(),
    },
  };

  beforeEach(async () => {
    registroService = jasmine.createSpyObj<RegistroService>(
      "RegistroService",
      ["registrarUsuario"]
    );

    registroService.registrarUsuario.and.returnValue(
      of(respuestaPrueba)
    );

    await TestBed.configureTestingModule({
      imports: [AuthRegistroComponent],
      providers: [
        {
          provide: RegistroService,
          useValue: registroService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthRegistroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("debería crear el componente", () => {
    expect(component).toBeTruthy();
  });

  it("debería iniciar con el plan mensual", () => {
    expect(component.plan).toBe("mensual");
  });

  it("debería seleccionar el plan anual", () => {
    component.seleccionarPlan("anual");
    expect(component.plan).toBe("anual");
  });

  it("debería seleccionar el plan mensual", () => {
    component.seleccionarPlan("mensual");
    expect(component.plan).toBe("mensual");
  });

  it("debería guardar el nombre", () => {
    component.nombre = "Carlos Rivera";
    expect(component.nombre).toBe("Carlos Rivera");
  });

  it("debería guardar el correo", () => {
    component.email = "carlos@ejemplo.com";
    expect(component.email).toBe("carlos@ejemplo.com");
  });

  it("debería guardar el teléfono", () => {
    component.telefono = "50200000000";
    expect(component.telefono).toBe("50200000000");
  });

  it("debería guardar la contraseña", () => {
    component.password = "12345678";
    expect(component.password).toBe("12345678");
  });

  it("debería cambiar la visibilidad de la contraseña", () => {
    component.mostrarPassword = true;
    expect(component.mostrarPassword).toBeTrue();
  });

  it("debería enviar los datos al backend", () => {
    component.nombre = "Carlos Rivera";
    component.email = "carlos@ejemplo.com";
    component.password = "12345678";

    component.crearCuenta();

    expect(registroService.registrarUsuario).toHaveBeenCalledWith({
      name: "Carlos Rivera",
      email: "carlos@ejemplo.com",
      password: "12345678",
    });

    expect(component.cuentaCreada).toBeTrue();
    expect(component.mensajeExito).toBe(
      "Tu cuenta fue creada correctamente."
    );
  });

  it("debería mostrar un error si el correo ya existe", () => {
    registroService.registrarUsuario.and.returnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 409,
            error: {
              error: "EMAIL_REGISTRADO",
              message: "Este correo ya está registrado.",
            },
          })
      )
    );

    component.nombre = "Carlos Rivera";
    component.email = "carlos@ejemplo.com";
    component.password = "12345678";

    component.crearCuenta();

    expect(component.cuentaCreada).toBeFalse();
    expect(component.mensajeError).toBe(
      "Este correo ya está registrado."
    );
  });
});