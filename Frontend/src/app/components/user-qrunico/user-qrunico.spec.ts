import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserQrunico } from './user-qrunico';

describe('UserQrunico', () => {
  let component: UserQrunico;
  let fixture: ComponentFixture<UserQrunico>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserQrunico]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserQrunico);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
