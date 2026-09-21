import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminFormularioCliente } from './admin-formulario-cliente';

describe('AdminFormularioCliente', () => {
  let component: AdminFormularioCliente;
  let fixture: ComponentFixture<AdminFormularioCliente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminFormularioCliente]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminFormularioCliente);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
