import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnilloAforo } from './anillo-aforo';

describe('AnilloAforo', () => {
  let component: AnilloAforo;
  let fixture: ComponentFixture<AnilloAforo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnilloAforo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnilloAforo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
