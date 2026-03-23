import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let routerMock: { navigateByUrl: jest.Mock };

  beforeEach(async () => {
    routerMock = {
      navigateByUrl: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        { provide: Router, useValue: routerMock },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    // UT-CMP-HOM-00
    // But : vérifier que HomeComponent est correctement instancié.
    // Entrants : aucun.
    // Résultat attendu : le composant est créé.
    expect(component).toBeTruthy();
  });

  it('UT-CMP-HOM-01: should navigate to /register', () => {
    // UT-CMP-HOM-01
    // But : vérifier la navigation vers la page d'inscription.
    // Entrants : aucun.
    // Résultat attendu : navigateByUrl('/register') est appelé.
    component.onNavigateToRegister();

    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/register');
  });

  it('UT-CMP-HOM-02: should navigate to /login', () => {
    // UT-CMP-HOM-02
    // But : vérifier la navigation vers la page de connexion.
    // Entrants : aucun.
    // Résultat attendu : navigateByUrl('/login') est appelé.
    component.onNavigateToLogin();

    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/login');
  });
});
