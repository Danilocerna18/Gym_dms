import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminFormularioMaquina } from './admin-formulario-maquina';

describe('AdminFormularioMaquina', () => {
  let component: AdminFormularioMaquina;
  let fixture: ComponentFixture<AdminFormularioMaquina>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminFormularioMaquina]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminFormularioMaquina);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
