import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth.service';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Login } from '../models/Login';
import { Token } from '../models/Token';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('UT-SVC-AUT-01: should call POST /api/login and persist session on success', () => {
    // UT-SVC-AUT-01
    // But : vérifier que AuthService.login envoie POST /api/login et enregistre la session.
    // Entrants : identifiants valides + réponse token valide (idToken, expiresIn).
    // Résultat attendu : requête HTTP POST correcte, puis stockage de id_token et expires_at.
    const credentials: Login = { login: 'ada', password: 'secret' };
    const token: Token = { idToken: 'jwt-token', expiresIn: 3600 };
    let receivedToken: Token | undefined;

    service.login(credentials).subscribe((response) => {
      receivedToken = response;
    });

    const request = httpMock.expectOne('/api/login');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(credentials);
    request.flush(token);

    expect(receivedToken).toEqual(token);
    expect(localStorage.getItem('id_token')).toBe('jwt-token');
    expect(localStorage.getItem('expires_at')).not.toBeNull();
  });

  it('UT-SVC-AUT-02: should propagate HTTP 400 error when login credentials are invalid', () => {
    // UT-SVC-AUT-02
    // But : vérifier que AuthService.login propage une erreur 400 (identifiants invalides).
    // Entrants : login/mot de passe invalides.
    // Résultat attendu : erreur HTTP 400 propagée et aucune session stockée.
    const credentials: Login = { login: 'ada', password: 'wrong' };
    let receivedStatus: number | undefined;

    service.login(credentials).subscribe({
      next: () => fail('La souscription ne doit pas passer dans next pour un cas 400.'),
      error: (error) => {
        receivedStatus = error.status;
      },
    });

    const request = httpMock.expectOne('/api/login');
    expect(request.request.method).toBe('POST');
    request.flush({ message: 'Bad request' }, { status: 400, statusText: 'Bad Request' });

    expect(receivedStatus).toBe(400);
    expect(localStorage.getItem('id_token')).toBeNull();
    expect(localStorage.getItem('expires_at')).toBeNull();
  });

  it('UT-SVC-AUT-03: should propagate HTTP 400 error when login payload is incomplete', () => {
    // UT-SVC-AUT-03
    // But : vérifier que AuthService.login propage une erreur 400 (payload incomplet).
    // Entrants : login/password incomplets.
    // Résultat attendu : erreur HTTP 400 propagée et aucune session stockée.
    const incompleteCredentials = { login: '', password: '' } as Login;
    let receivedStatus: number | undefined;

    service.login(incompleteCredentials).subscribe({
      next: () => fail('La souscription ne doit pas passer dans next pour un cas 400.'),
      error: (error) => {
        receivedStatus = error.status;
      },
    });

    const request = httpMock.expectOne('/api/login');
    expect(request.request.method).toBe('POST');
    request.flush({ message: 'Bad request' }, { status: 400, statusText: 'Bad Request' });

    expect(receivedStatus).toBe(400);
    expect(localStorage.getItem('id_token')).toBeNull();
    expect(localStorage.getItem('expires_at')).toBeNull();
  });

  it('UT-SVC-AUT-04: should remove session keys on logout', () => {
    // UT-SVC-AUT-04
    // But : vérifier que AuthService.logout supprime les informations de session.
    // Entrants : localStorage contient id_token et expires_at.
    // Résultat attendu : les clés id_token et expires_at sont supprimées.
    localStorage.setItem('id_token', 'jwt-token');
    localStorage.setItem('expires_at', JSON.stringify(Date.now() + 3600_000));

    service.logout();

    expect(localStorage.getItem('id_token')).toBeNull();
    expect(localStorage.getItem('expires_at')).toBeNull();
  });

  it('UT-SVC-AUT-05: should return true for isLoggedIn when token is not expired', () => {
    // UT-SVC-AUT-05
    // But : vérifier que isLoggedIn retourne true si la session n'est pas expirée.
    // Entrants : expires_at positionné dans le futur.
    // Résultat attendu : isLoggedIn() retourne true.
    localStorage.setItem('expires_at', JSON.stringify(Date.now() + 60_000));

    expect(service.isLoggedIn()).toBe(true);
  });

  it('UT-SVC-AUT-06: should return false for isLoggedIn when token is expired or missing', () => {
    // UT-SVC-AUT-06
    // But : vérifier que isLoggedIn retourne false si la session est expirée ou absente.
    // Entrants : expires_at passé puis expires_at absent.
    // Résultat attendu : isLoggedIn() retourne false dans les deux cas.
    localStorage.setItem('expires_at', JSON.stringify(Date.now() - 60_000));
    expect(service.isLoggedIn()).toBe(false);

    localStorage.removeItem('expires_at');
    expect(service.isLoggedIn()).toBe(false);
  });

  it('UT-SVC-AUT-07: should keep isLoggedOut consistent with isLoggedIn', () => {
    // UT-SVC-AUT-07
    // But : vérifier que isLoggedOut est l'inverse logique de isLoggedIn.
    // Entrants : un cas connecté puis un cas déconnecté.
    // Résultat attendu : isLoggedOut() = !isLoggedIn() dans les deux situations.
    localStorage.setItem('expires_at', JSON.stringify(Date.now() + 60_000));
    expect(service.isLoggedOut()).toBe(!service.isLoggedIn());

    localStorage.setItem('expires_at', JSON.stringify(Date.now() - 60_000));
    expect(service.isLoggedOut()).toBe(!service.isLoggedIn());
  });
});
