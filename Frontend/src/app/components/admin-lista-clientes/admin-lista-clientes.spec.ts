import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminListaClientes } from './admin-lista-clientes';

describe('AdminListaClientes', () => {
  let component: AdminListaClientes;
  let fixture: ComponentFixture<AdminListaClientes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminListaClientes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminListaClientes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
