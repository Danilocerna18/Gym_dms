import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthRegistro } from './auth-registro';

describe('AuthRegistro', () => {
  let component: AuthRegistro;
  let fixture: ComponentFixture<AuthRegistro>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthRegistro]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuthRegistro);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
