import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodigoQr } from './codigo-qr';

describe('CodigoQr', () => {
  let component: CodigoQr;
  let fixture: ComponentFixture<CodigoQr>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodigoQr]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CodigoQr);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
