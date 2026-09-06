import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserMaquinadet } from './user-maquinadet';

describe('UserMaquinadet', () => {
  let component: UserMaquinadet;
  let fixture: ComponentFixture<UserMaquinadet>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserMaquinadet]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserMaquinadet);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
