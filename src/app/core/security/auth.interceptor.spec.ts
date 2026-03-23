import { TestBed } from '@angular/core/testing';
import { HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { of } from 'rxjs';

import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  const interceptor: HttpInterceptorFn = (req, next) => 
    TestBed.runInInjectionContext(() => authInterceptor(req, next));

  beforeEach(() => {
    TestBed.configureTestingModule({});
    localStorage.clear();
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });

  it('adds an Authorization header when token is in localStorage', (done) => {
    localStorage.setItem('id_token', 'ABC123');
    const req = new HttpRequest('GET', '/foo');

    const next = (r: HttpRequest<any>) => {
      expect(r.headers.get('Authorization')).toBe('Bearer ABC123');
      return of(null);
    };

    interceptor(req, next).subscribe(() => done());
  });

  it('passes through unchanged when no token', (done) => {
    const req = new HttpRequest('GET', '/foo');

    const next = (r: HttpRequest<any>) => {
      expect(r.headers.has('Authorization')).toBe(false);
      return of(null);
    };

    interceptor(req, next).subscribe(() => done());
  });
});
