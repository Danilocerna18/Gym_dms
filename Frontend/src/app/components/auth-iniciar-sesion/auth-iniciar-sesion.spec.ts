import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthIniciarSesion } from './auth-iniciar-sesion';

describe('AuthIniciarSesion', () => {
  let component: AuthIniciarSesion;
  let fixture: ComponentFixture<AuthIniciarSesion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthIniciarSesion]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuthIniciarSesion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
