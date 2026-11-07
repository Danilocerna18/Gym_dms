import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserEscaner } from './user-escaner';

describe('UserEscaner', () => {
  let component: UserEscaner;
  let fixture: ComponentFixture<UserEscaner>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserEscaner]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserEscaner);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
