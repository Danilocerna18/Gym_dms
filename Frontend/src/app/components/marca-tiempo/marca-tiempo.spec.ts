import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarcaTiempo } from './marca-tiempo';

describe('MarcaTiempo', () => {
  let component: MarcaTiempo;
  let fixture: ComponentFixture<MarcaTiempo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MarcaTiempo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MarcaTiempo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
