import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CampoFormulario } from './campo-formulario';

describe('CampoFormulario', () => {
  let component: CampoFormulario;
  let fixture: ComponentFixture<CampoFormulario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CampoFormulario]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CampoFormulario);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
