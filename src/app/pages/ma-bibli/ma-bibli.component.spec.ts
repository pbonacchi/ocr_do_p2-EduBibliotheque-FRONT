import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from '../../core/security/auth.service';

import { MaBibliComponent } from './ma-bibli.component';

describe('MaBibliComponent', () => {
  let component: MaBibliComponent;
  let fixture: ComponentFixture<MaBibliComponent>;
  let authServiceMock: { isLoggedIn: jest.Mock; logout: jest.Mock };
  let routerMock: { navigate: jest.Mock };

  beforeEach(async () => {
    authServiceMock = {
      isLoggedIn: jest.fn().mockReturnValue(true),
      logout: jest.fn(),
    };
    routerMock = {
      navigate: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [MaBibliComponent],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(MaBibliComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    // UT-CMP-MAB-00
    // But : vérifier que MaBibliComponent est correctement instancié.
    // Entrants : aucun.
    // Résultat attendu : le composant est créé.
    expect(component).toBeTruthy();
  });

  it('UT-CMP-MAB-01: should logout and navigate to home page', () => {
    // UT-CMP-MAB-01
    // But : vérifier le comportement de déconnexion utilisateur.
    // Entrants : utilisateur connecté.
    // Résultat attendu : authService.logout() puis navigation vers '/'.
    component.logout();

    expect(authServiceMock.logout).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
  });
});
