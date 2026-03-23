import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
    }).compileComponents();
  });

  it('should create the app', () => {
    // UT-CMP-APP-01
    // But : vérifier que le composant racine est instancié.
    // Entrants : aucun.
    // Résultat attendu : AppComponent est créé.
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have the 'etudiant-frontend' title`, () => {
    // UT-CMP-APP-02
    // But : vérifier la valeur du titre exposé par AppComponent.
    // Entrants : aucun.
    // Résultat attendu : title === 'etudiant-frontend'.
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('etudiant-frontend');
  });
});
