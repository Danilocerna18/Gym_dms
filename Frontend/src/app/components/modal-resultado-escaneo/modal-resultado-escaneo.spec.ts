import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalResultadoEscaneo } from './modal-resultado-escaneo';

describe('ModalResultadoEscaneo', () => {
  let component: ModalResultadoEscaneo;
  let fixture: ComponentFixture<ModalResultadoEscaneo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalResultadoEscaneo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalResultadoEscaneo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
