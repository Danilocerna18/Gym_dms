import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminAnuncios } from './admin-anuncios';

describe('AdminAnuncios', () => {
  let component: AdminAnuncios;
  let fixture: ComponentFixture<AdminAnuncios>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminAnuncios]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminAnuncios);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
