import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';

import { Acceso } from './acceso';

describe('Acceso', () => {
  let service: Acceso;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient()]
    });
    service = TestBed.inject(Acceso);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
