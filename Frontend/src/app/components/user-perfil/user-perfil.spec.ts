import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserPerfil } from './user-perfil';

describe('UserPerfil', () => {
  let component: UserPerfil;
  let fixture: ComponentFixture<UserPerfil>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserPerfil]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserPerfil);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
