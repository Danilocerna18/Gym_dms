import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminFormularioMaquinaComponent } from './admin-formulario-maquina';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

describe('AdminFormularioMaquinaComponent', () => {

  let component: AdminFormularioMaquinaComponent;
  let fixture: ComponentFixture<AdminFormularioMaquinaComponent>;
  let router: Router;

  beforeEach(async () => {

    await TestBed.configureTestingModule({
      imports: [
        AdminFormularioMaquinaComponent,
        FormsModule
      ],
      providers: [
        {
          provide: Router,
          useValue: {
            navigate: jasmine.createSpy('navigate')
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminFormularioMaquinaComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);

    fixture.detectChanges();
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería regresar a la lista de máquinas', () => {

    component.regresar();

    expect(router.navigate).toHaveBeenCalledWith([
      '/admin-lista-maquinas'
    ]);

  });

  it('debería seleccionar un grupo muscular', () => {

    component.seleccionarGrupo('Pecho y Tríceps');

    expect(component.grupoMuscular).toBe('Pecho y Tríceps');

  });

  it('debería tener un nombre de máquina por defecto', () => {

    expect(component.nombreMaquina)
      .toBe('Prensa de Piernas 45° Inclinada');

  });

  it('debería tener un grupo muscular por defecto', () => {

    expect(component.grupoMuscular)
      .toBe('Cuádriceps y Glúteos');

  });

  it('debería tener el identificador QR', () => {

    expect(component.idMaquina)
      .toBe('QR-MCH-8942-PR45');

  });

  it('debería eliminar el video', () => {

    component.mostrarVideo = true;

    component.eliminarVideo();

    expect(component.videoSeleccionado).toBeNull();
    expect(component.mostrarVideo).toBeFalse();

  });

  it('debería seleccionar un video', () => {

    const archivo = new File(
      ['video de prueba'],
      'video-prueba.mp4',
      {
        type: 'video/mp4'
      }
    );

    const evento = {
      target: {
        files: [archivo],
        value: ''
      }
    } as unknown as Event;

    component.seleccionarVideo(evento);

    expect(component.videoSeleccionado).toBe(archivo);
    expect(component.mostrarVideo).toBeTrue();

  });

  it('debería mostrar el toast al guardar', () => {

    component.guardarMaquina();

    expect(component.mostrarToast).toBeTrue();

  });

  it('debería copiar el identificador QR', async () => {

    const copiar = spyOn(
      navigator.clipboard,
      'writeText'
    ).and.returnValue(Promise.resolve());

    spyOn(window, 'alert');

    component.copiarId();

    expect(copiar).toHaveBeenCalledWith(
      'QR-MCH-8942-PR45'
    );

  });

});