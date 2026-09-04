import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstadoVacio } from './estado-vacio';

describe('EstadoVacio', () => {
  let component: EstadoVacio;
  let fixture: ComponentFixture<EstadoVacio>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstadoVacio]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EstadoVacio);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
