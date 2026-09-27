import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';

import { AdminEscanerAcceso } from './admin-escaner-acceso';

describe('AdminEscanerAcceso', () => {
  let component: AdminEscanerAcceso;
  let fixture: ComponentFixture<AdminEscanerAcceso>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminEscanerAcceso],
      providers: [provideHttpClient()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminEscanerAcceso);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
