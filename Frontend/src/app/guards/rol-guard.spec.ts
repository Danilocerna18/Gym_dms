import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom, Observable } from 'rxjs';
import { rolGuard } from './rol-guard';

describe('rolGuard', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()]
  }));

  it.each([['member', 'admin', '/user-home'], ['admin', 'member', '/admin/dashboard']])(
    'rechaza %s en rutas %s', async (role, required, destination) => {
      const result = TestBed.runInInjectionContext(() => rolGuard(
        { data: { role: required } } as unknown as ActivatedRouteSnapshot, {} as RouterStateSnapshot
      ));
      const promise = firstValueFrom(result as Observable<any>);
      TestBed.inject(HttpTestingController).expectOne('http://localhost:3000/api/users/me')
        .flush({ user: { role } });
      expect(TestBed.inject(Router).serializeUrl(await promise)).toBe(destination);
    }
  );
});
