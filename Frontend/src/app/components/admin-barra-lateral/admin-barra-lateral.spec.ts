import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminBarraLateral } from './admin-barra-lateral';

describe('AdminBarraLateral', () => {
  let component: AdminBarraLateral;
  let fixture: ComponentFixture<AdminBarraLateral>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminBarraLateral]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminBarraLateral);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
