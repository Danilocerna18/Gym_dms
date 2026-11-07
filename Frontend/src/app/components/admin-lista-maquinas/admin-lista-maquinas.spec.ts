import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminListaMaquinasComponent } from './admin-lista-maquinas';

describe('AdminListaMaquinasComponent', () => {

  let component: AdminListaMaquinasComponent;
  let fixture: ComponentFixture<AdminListaMaquinasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminListaMaquinasComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminListaMaquinasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería iniciar con el filtro todas', () => {
    expect(component.filtroActual).toBe('todas');
  });

  it('debería seleccionar cardio', () => {
    component.seleccionarFiltro('cardio');

    expect(component.filtroActual).toBe('cardio');
  });

  it('debería seleccionar peso libre', () => {
    component.seleccionarFiltro('peso');

    expect(component.filtroActual).toBe('peso');
  });

  it('debería seleccionar funcional', () => {
    component.seleccionarFiltro('funcional');

    expect(component.filtroActual).toBe('funcional');
  });

  it('debería seleccionar mantenimiento', () => {
    component.seleccionarFiltro('mantenimiento');

    expect(component.filtroActual).toBe('mantenimiento');
  });

  it('debería guardar la búsqueda', () => {
    component.busqueda = 'Treadmill';

    expect(component.busqueda).toBe('Treadmill');
  });

});