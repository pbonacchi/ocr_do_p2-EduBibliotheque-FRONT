import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { LoginComponent } from './login.component';
import { AuthService } from '../../core/security/auth.service';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authSpy: { isLoggedIn: jest.Mock; login: jest.Mock };
  let router: Router;
  let navigateByUrlSpy: jest.SpyInstance;
  let activatedRouteStub: ActivatedRoute;

  beforeEach(async () => {
    authSpy = {
      isLoggedIn: jest.fn(),
      login: jest.fn(),
    };
    activatedRouteStub = { snapshot: { queryParams: {} } as any } as ActivatedRoute;

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authSpy },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
      ]
    })
    .compileComponents();

    router = TestBed.inject(Router);
    navigateByUrlSpy = jest.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    // UT-CMP-LOG-00
    // But : vérifier que LoginComponent est correctement instancié.
    // Entrants : utilisateur non connecté.
    // Résultat attendu : le composant est créé.
    authSpy.isLoggedIn.mockReturnValue(false);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('UT-CMP-LOG-04: should redirect immediately when already logged in', () => {
    // UT-CMP-LOG-04
    // But : vérifier la redirection immédiate quand l'utilisateur est déjà authentifié.
    // Entrants : isLoggedIn=true + returnUrl présent.
    // Résultat attendu : navigation vers returnUrl sans soumission du formulaire.
    activatedRouteStub.snapshot.queryParams = { returnUrl: '/students' };
    authSpy.isLoggedIn.mockReturnValue(true);
    component.ngOnInit();

    expect(navigateByUrlSpy).toHaveBeenCalledWith('/students');
  });

  it('UT-CMP-LOG-01: should navigate to returnUrl after successful login', fakeAsync(() => {
    // UT-CMP-LOG-01
    // But : vérifier le parcours succès de connexion avec returnUrl.
    // Entrants : formulaire valide + login() succès + returnUrl présent.
    // Résultat attendu : loading=true puis navigation vers returnUrl après 2s.
    activatedRouteStub.snapshot.queryParams = { returnUrl: '/students' };
    authSpy.isLoggedIn.mockReturnValue(false);
    authSpy.login.mockReturnValue(of({ idToken: 't', expiresIn: 1000 }));

    fixture.detectChanges();
    component.loginForm.setValue({ login: 'x', password: 'y' });
    component.onSubmit();
    expect(component.loading).toBe(true);
    tick(2000);

    expect(navigateByUrlSpy).toHaveBeenCalledWith('/students');
  }));

  it('UT-CMP-LOG-01B: should navigate to /ma-bibli when no returnUrl is provided', fakeAsync(() => {
    // UT-CMP-LOG-01B
    // But : vérifier le fallback de navigation après connexion réussie.
    // Entrants : formulaire valide + login() succès + pas de returnUrl.
    // Résultat attendu : navigation vers /ma-bibli après 2s.
    activatedRouteStub.snapshot.queryParams = {};
    authSpy.isLoggedIn.mockReturnValue(false);
    authSpy.login.mockReturnValue(of({ idToken: 't', expiresIn: 1000 }));

    fixture.detectChanges();
    component.loginForm.setValue({ login: 'x', password: 'y' });
    component.onSubmit();
    tick(2000);

    expect(navigateByUrlSpy).toHaveBeenCalledWith('/ma-bibli');
  }));

  it('UT-CMP-LOG-02: should not submit when form is invalid', () => {
    // UT-CMP-LOG-02
    // But : vérifier qu'un formulaire invalide ne déclenche pas login().
    // Entrants : formulaire vide.
    // Résultat attendu : aucun appel auth.login(), loading=false, submitted=true.
    authSpy.isLoggedIn.mockReturnValue(false);
    fixture.detectChanges();

    component.loginForm.setValue({ login: '', password: '' });
    component.onSubmit();

    expect(authSpy.login).not.toHaveBeenCalled();
    expect(component.loading).toBe(false);
    expect(component.submitted).toBe(true);
  });

  it('UT-CMP-LOG-03: should set errorMessage and stop loading on authentication error', () => {
    // UT-CMP-LOG-03
    // But : vérifier la gestion d'erreur d'authentification côté UI.
    // Entrants : formulaire valide + login() retourne une erreur backend.
    // Résultat attendu : errorMessage renseigné, pas de navigation, loading=false.
    authSpy.isLoggedIn.mockReturnValue(false);
    authSpy.login.mockReturnValue(
      throwError(() => ({ error: { message: 'Invalid credentials' } }))
    );
    fixture.detectChanges();

    component.loginForm.setValue({ login: 'x', password: 'bad' });
    component.onSubmit();

    expect(component.errorMessage).toBe('Invalid credentials');
    expect(component.loading).toBe(false);
    expect(navigateByUrlSpy).not.toHaveBeenCalled();
  });
});
