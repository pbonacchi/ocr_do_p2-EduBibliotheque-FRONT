import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of } from 'rxjs';

import { LoginComponent } from './login.component';
import { AuthService } from '../../core/security/auth.service';
import { Router, ActivatedRoute } from '@angular/router';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let activatedRouteStub: Partial<ActivatedRoute>;

  beforeEach(async () => {
    authSpy = jasmine.createSpyObj('AuthService', ['isLoggedIn', 'login']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl']);
    activatedRouteStub = { snapshot: { queryParams: {} } };

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    authSpy.isLoggedIn.and.returnValue(false);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('redirects to ma-bibli if already logged in', () => {
    activatedRouteStub.snapshot.queryParams = { returnUrl: '/students' };
    authSpy.isLoggedIn.and.returnValue(true);
    fixture.detectChanges();

    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/students');
  });

  it('navigates to returnUrl after successful login', fakeAsync(() => {
    activatedRouteStub.snapshot.queryParams = { returnUrl: '/students' };
    authSpy.isLoggedIn.and.returnValue(false);
    authSpy.login.and.returnValue(of({ idToken: 't', expiresIn: 1000 }));

    fixture.detectChanges();
    component.loginForm.setValue({ login: 'x', password: 'y' });
    component.onSubmit();
    tick(2000);

    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/students');
  }));

  it('navigates to ma-bibli when no returnUrl provided', fakeAsync(() => {
    activatedRouteStub.snapshot.queryParams = {};
    authSpy.isLoggedIn.and.returnValue(false);
    authSpy.login.and.returnValue(of({ idToken: 't', expiresIn: 1000 }));

    fixture.detectChanges();
    component.loginForm.setValue({ login: 'x', password: 'y' });
    component.onSubmit();
    tick(2000);

    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/ma-bibli');
  }));
});
