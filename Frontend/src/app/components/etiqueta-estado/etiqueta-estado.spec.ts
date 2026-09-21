import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EtiquetaEstado } from './etiqueta-estado';

describe('EtiquetaEstado', () => {
  let component: EtiquetaEstado;
  let fixture: ComponentFixture<EtiquetaEstado>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EtiquetaEstado]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EtiquetaEstado);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
