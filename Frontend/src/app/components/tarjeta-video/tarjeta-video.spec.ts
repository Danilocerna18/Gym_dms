import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TarjetaVideo } from './tarjeta-video';

describe('TarjetaVideo', () => {
  let component: TarjetaVideo;
  let fixture: ComponentFixture<TarjetaVideo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TarjetaVideo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TarjetaVideo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
