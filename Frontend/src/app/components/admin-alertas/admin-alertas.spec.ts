import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminAlertas } from './admin-alertas';

describe('AdminAlertas', () => {
  let component: AdminAlertas;
  let fixture: ComponentFixture<AdminAlertas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminAlertas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminAlertas);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
