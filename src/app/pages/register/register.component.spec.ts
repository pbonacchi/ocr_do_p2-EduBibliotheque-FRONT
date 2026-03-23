import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { RegisterComponent } from './register.component';
import { provideHttpClient } from '@angular/common/http';
import { UserService } from '../../core/service/user.service';
import { provideRouter, Router } from '@angular/router';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let userServiceMock: { register: jest.Mock };
  let router: Router;
  let navigateByUrlSpy: jest.SpyInstance;

  beforeEach(async () => {
    userServiceMock = {
      register: jest.fn().mockReturnValue(of({ message: 'created' })),
    };

    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: UserService, useValue: userServiceMock },
      ],
    })
    .compileComponents();

    router = TestBed.inject(Router);
    navigateByUrlSpy = jest.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    // UT-CMP-REG-00
    // But : vérifier que RegisterComponent est correctement instancié.
    // Entrants : aucun.
    // Résultat attendu : le composant est créé.
    expect(component).toBeTruthy();
  });

  it('UT-CMP-REG-01: should submit valid form and navigate to /login', () => {
    // UT-CMP-REG-01
    // But : vérifier le parcours succès d'inscription.
    // Entrants : formulaire valide (firstName, lastName, login, password).
    // Résultat attendu : appel userService.register() puis navigation vers /login.
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => undefined);

    component.registerForm.setValue({
      firstName: 'Ada',
      lastName: 'Lovelace',
      login: 'ada',
      password: 'secret',
    });

    component.onSubmit();

    expect(userServiceMock.register).toHaveBeenCalledWith({
      firstName: 'Ada',
      lastName: 'Lovelace',
      login: 'ada',
      password: 'secret',
    });
    expect(navigateByUrlSpy).toHaveBeenCalledWith('/login');
    expect(alertSpy).toHaveBeenCalled();
    alertSpy.mockRestore();
  });

  it('UT-CMP-REG-02: should not submit when form is invalid', () => {
    // UT-CMP-REG-02
    // But : vérifier qu'un formulaire invalide n'est pas soumis.
    // Entrants : formulaire vide.
    // Résultat attendu : aucun appel userService.register() et submitted=true.
    component.registerForm.setValue({
      firstName: '',
      lastName: '',
      login: '',
      password: '',
    });

    component.onSubmit();

    expect(component.submitted).toBe(true);
    expect(userServiceMock.register).not.toHaveBeenCalled();
    expect(navigateByUrlSpy).not.toHaveBeenCalled();
  });

  it('UT-CMP-REG-03: should keep UI stable when backend returns 400', () => {
    // UT-CMP-REG-03
    // But : vérifier la stabilité du composant en cas d'erreur backend 400.
    // Entrants : formulaire valide, réponse erreur 400.
    // Résultat attendu : pas de navigation et pas de crash du composant.
    userServiceMock.register.mockReturnValueOnce(
      throwError(() => ({ status: 400, error: { message: 'Bad request' } }))
    );
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => undefined);

    component.registerForm.setValue({
      firstName: 'Ada',
      lastName: 'Lovelace',
      login: 'ada',
      password: 'secret',
    });

    expect(() => component.onSubmit()).not.toThrow();
    expect(navigateByUrlSpy).not.toHaveBeenCalled();
    expect(alertSpy).not.toHaveBeenCalled();
    alertSpy.mockRestore();
  });

  it('UT-CMP-REG-04: should keep UI stable when backend returns 500', () => {
    // UT-CMP-REG-04
    // But : vérifier la stabilité du composant en cas d'erreur technique 500/réseau.
    // Entrants : formulaire valide, réponse erreur 500.
    // Résultat attendu : pas de navigation et pas de crash du composant.
    userServiceMock.register.mockReturnValueOnce(
      throwError(() => ({ status: 500, error: { message: 'Server error' } }))
    );
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => undefined);

    component.registerForm.setValue({
      firstName: 'Ada',
      lastName: 'Lovelace',
      login: 'ada',
      password: 'secret',
    });

    expect(() => component.onSubmit()).not.toThrow();
    expect(navigateByUrlSpy).not.toHaveBeenCalled();
    expect(alertSpy).not.toHaveBeenCalled();
    alertSpy.mockRestore();
  });

  it('UT-CMP-REG-05: should reset form and submitted flag', () => {
    // UT-CMP-REG-05
    // But : vérifier la réinitialisation du formulaire d'inscription.
    // Entrants : formulaire pré-rempli et submitted=true.
    // Résultat attendu : formulaire reset et submitted=false.
    component.submitted = true;
    component.registerForm.setValue({
      firstName: 'Ada',
      lastName: 'Lovelace',
      login: 'ada',
      password: 'secret',
    });

    component.onReset();

    expect(component.submitted).toBe(false);
    expect(component.registerForm.value).toEqual({
      firstName: null,
      lastName: null,
      login: null,
      password: null,
    });
  });
});
