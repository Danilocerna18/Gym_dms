import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminListaMaquinas } from './admin-lista-maquinas';

describe('AdminListaMaquinas', () => {
  let component: AdminListaMaquinas;
  let fixture: ComponentFixture<AdminListaMaquinas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminListaMaquinas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminListaMaquinas);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
