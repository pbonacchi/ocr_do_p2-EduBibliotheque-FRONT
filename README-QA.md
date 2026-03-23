# Plan de tests QA Frontend (Composants + Services)

## 1) Objectif

Ce document décrit le plan de tests unitaires/intégration légère frontend pour l'application Angular, limité dans un premier temps aux **composants** et **services**.

## 2) Périmètre (Scope)

### Inclus

- Composants UI Angular:
  - rendu minimal attendu,
  - interactions utilisateur (clic, submit, reset),
  - gestion d'état d'interface (`loading`, `errorMessage`, `successMessage`, mode édition/création),
  - comportements `Input` / `Output` (ex. `StudentDetailsComponent`).
- Services frontend:
  - logique métier frontend,
  - appels HTTP (mockés),
  - émission d'événements/notifications (ex. `studentChanged$`),
  - gestion session/authentification côté client (`localStorage`, expiration token).
- Intégration légère composant-service via mocks/stubs.

### Exclu

- Tests E2E (Cypress, Playwright) -> traités ultérieurement.
- Tests backend (controllers, persistence, sécurité serveur).
- Intégration complète avec serveur réel.
- Tests de performance frontend, charge, sécurité dynamique.
- Tests visuels pixel-perfect.

## 3) Types de tests concernés

### Tests de composants

- **Objectif:** vérifier le comportement visible pour l'utilisateur.
- **Cibles principales:** `HomeComponent`, `LoginComponent`, `RegisterComponent`, `MaBibliComponent`, `StudentsListComponent`, `StudentDetailsComponent`, `AppComponent`.
- **Exemples de vérification:** navigation, validation formulaire, affichage états (`loading/error/success`), émission d'events.

### Tests de services

- **Objectif:** vérifier la logique frontend et les contrats HTTP.
- **Cibles principales:** `UserService`, `AuthService`.
- **Exemples de vérification:** URL/méthode HTTP, payload, gestion erreurs, émission Subject, stockage/lecture session.

## 4) Stratégie de test

### Isolation

- Dépendances mockées (services, routeur, APIs HTTP).
- Pas de backend réel.
- DOM simulé via environnement de test Angular/Jest (pas de navigateur complet).
- Horloge contrôlée pour les comportements temporels (ex. redirection après timeout login).

### Approche

- **Composants:** tester les effets observables (rendu/état/navigation/events), éviter les détails d'implémentation interne.
- **Services:** tester la logique pure + les appels HTTP via `HttpTestingController`.
- **Priorisation:** parcours critiques en premier (authentification, enregistrement, CRUD étudiant, logout).

## 5) Environnement de test

- Framework frontend: **Angular 19**
- Runner: **Jest 29**
- Preset Angular Jest: **jest-preset-angular**
- Outils Angular test:
  - `TestBed`,
  - `ComponentFixture`,
  - `provideRouter`,
  - `provideHttpClient`,
  - `provideHttpClientTesting`,
  - `HttpTestingController`.
- Mocks: `jest.fn()`, spies Jest.
- Utilitaires async: `fakeAsync`, `tick` (si nécessaire pour timers).

## 6) Données de test

- Jeux de données mockés pour utilisateurs/étudiants:
  - cas valides (payload complet),
  - cas invalides (champs requis manquants),
  - cas limites (id absent, tableaux vides),
  - cas erreurs (HTTP 400/401/404/500, erreur réseau).
- Données auth:
  - token valide,
  - token expiré,
  - absence de token.

## 7) Cas de tests (table de référence)

| ID | Type | Cible | Description | Préconditions | Entrées | Action | Résultat attendu |
| --- | --- | --- | --- | --- | --- | --- | --- |
| UT-CMP-APP-01 | Composant | AppComponent | Crée le composant principal | TestBed initialisé | aucune | création composant | composant instancié |
| UT-CMP-HOM-01 | Composant | HomeComponent | Navigation vers register (succès) | router mocké | aucune | `onNavigateToRegister()` | `navigateByUrl('/register')` appelé |
| UT-CMP-HOM-02 | Composant | HomeComponent | Navigation vers login (succès) | router mocké | aucune | `onNavigateToLogin()` | `navigateByUrl('/login')` appelé |
| UT-CMP-LOG-01 | Composant | LoginComponent | Submit valide (succès) | formulaire initialisé, auth mock success | login/password valides | `onSubmit()` | `loading=true`, message succès, navigation vers `returnUrl` ou `/ma-bibli` après délai |
| UT-CMP-LOG-02 | Composant | LoginComponent | Submit invalide | formulaire vide | champs manquants | `onSubmit()` | pas d'appel auth, `loading=false`, `submitted=true` |
| UT-CMP-LOG-03 | Composant | LoginComponent | Erreur authentification | auth mock erreur HTTP | login/password incorrects | `onSubmit()` | `errorMessage` renseigné, pas de navigation, `loading=false` |
| UT-CMP-LOG-04 | Composant | LoginComponent | Utilisateur déjà connecté | `isLoggedIn()` retourne true | `returnUrl` présent/absent | `ngOnInit()` | redirection immédiate vers destination |
| UT-CMP-REG-01 | Composant | RegisterComponent | Submit valide (succès) | formulaire initialisé, service mock success | champs obligatoires valides | `onSubmit()` | `userService.register(...)` appelé, navigation `/login` |
| UT-CMP-REG-02 | Composant | RegisterComponent | Submit invalide | formulaire vide | champs manquants | `onSubmit()` | pas d'appel service, `submitted=true` |
| UT-CMP-REG-03 | Composant | RegisterComponent | Reset formulaire | formulaire dirty | aucune | `onReset()` | formulaire vide, `submitted=false` |
| UT-CMP-MAB-01 | Composant | MaBibliComponent | Logout (succès) | auth/router mockés | aucune | `logout()` | `authService.logout()` + navigation `'/'` |
| UT-CMP-STL-01 | Composant | StudentsListComponent | Chargement liste (succès) | service mock getAll success | liste étudiants | `ngOnInit()` / `retrieveStudents()` | `students` alimenté |
| UT-CMP-STL-02 | Composant | StudentsListComponent | Réception événement create | `students` initialisé | action `{create}` | émission sur `studentChanged$` | étudiant ajouté, sélection activée, mode création fermé |
| UT-CMP-STL-03 | Composant | StudentsListComponent | Réception événement update | `students` contient id cible | action `{update}` | émission sur `studentChanged$` | étudiant remplacé |
| UT-CMP-STL-04 | Composant | StudentsListComponent | Réception événement delete | `students` contient id cible | action `{delete}` | émission sur `studentChanged$` | étudiant supprimé |
| UT-CMP-STL-05 | Composant | StudentsListComponent | Démarrer création | composant initialisé | aucune | `startCreatingStudent()` | `isCreatingStudent=true`, `currentIndex=-1` |
| UT-CMP-STD-01 | Composant | StudentDetailsComponent | Création étudiant valide (succès) | `isCreating=true`, form valide, service create mock success | prénom/nom/login valides | `createStudent()` | create appelé, message succès, form reset, `notifyStudentChanged(create)` |
| UT-CMP-STD-02 | Composant | StudentDetailsComponent | Création invalide | mode création | formulaire invalide | `createStudent()` | aucun appel service |
| UT-CMP-STD-03 | Composant | StudentDetailsComponent | Mise à jour valide (succès) | `currentStudent.id` présent, form valide, update mock success | champs modifiés | `updateStudent()` | update appelé, message succès, `notifyStudentChanged(update)` |
| UT-CMP-STD-04 | Composant | StudentDetailsComponent | Mise à jour invalide | id absent ou form invalide | données invalides | `updateStudent()` | aucun appel update |
| UT-CMP-STD-05 | Composant | StudentDetailsComponent | Suppression valide (succès) | `currentStudent.id` présent, delete mock success | id existant | `deleteStudent()` | delete appelé, message succès, `notifyStudentChanged(delete)` |
| UT-CMP-STD-06 | Composant | StudentDetailsComponent | Annulation création | `isCreating=true` | aucune | `cancelEdit()` | emit `createCancelled` |
| UT-SVC-USR-01 | Service | UserService | `register()` HTTP succès | HTTP mock actif | payload register valide | appel `register(payload)` | POST `/api/register` avec body conforme |
| UT-SVC-USR-02 | Service | UserService | `getAll()` HTTP succès | HTTP mock actif | aucune | appel `getAll()` | GET `/api/students` |
| UT-SVC-USR-03 | Service | UserService | `get(id)` HTTP succès | HTTP mock actif | id valide | appel `get(id)` | GET `/api/students/:id` |
| UT-SVC-USR-04 | Service | UserService | `create()` HTTP succès | HTTP mock actif | payload étudiant valide | appel `create(data)` | POST `/api/students` |
| UT-SVC-USR-05 | Service | UserService | `update()` HTTP succès | HTTP mock actif | id + payload valide | appel `update(id,data)` | PUT `/api/students/:id` |
| UT-SVC-USR-06 | Service | UserService | `delete()` HTTP succès | HTTP mock actif | id valide | appel `delete(id)` | DELETE `/api/students/:id` |
| UT-SVC-USR-07 | Service | UserService | notification create (succès) | abonnement `studentChanged$` | action create | `notifyStudentChanged(action)` | émission action create reçue |
| UT-SVC-AUT-01 | Service | AuthService | login succès + session enregistrée | HTTP mock actif, localStorage nettoyé | credentials valides + token mock | appel `login()` | POST `/api/login`, `id_token` + `expires_at` stockés |
| UT-SVC-AUT-02 | Service | AuthService | logout supprime session | localStorage contient token | aucune | `logout()` | clés `id_token` et `expires_at` supprimées |
| UT-SVC-AUT-03 | Service | AuthService | `isLoggedIn` vrai si token non expiré | `expires_at` futur | aucune | `isLoggedIn()` | retourne true |
| UT-SVC-AUT-04 | Service | AuthService | `isLoggedIn` faux si token expiré/absent | `expires_at` passé ou null | aucune | `isLoggedIn()` | retourne false |

## 8) Critères d'acceptation

- Tous les tests du plan sont exécutés en CI et en local.
- 0 échec sur les tests critiques (`Login`, `Register`, `UserService`, `AuthService`).
- Couverture globale (lines/statements) >= **80%** (exigence projet).
- Aucune régression critique détectée sur les parcours auth et CRUD étudiants.
- Les tests sont stables (pas de flaky tests sur 3 exécutions consécutives).

## 9) Critères d'entrée / sortie

### Entrée

- Composants/services cibles implémentés.
- Contrats API frontend stabilisés (URL, méthodes, payloads, codes erreurs).
- Environnement Jest opérationnel (`npm test` OK).
- Données mock de référence définies.

### Sortie

- Tous les cas du scope exécutés.
- Tous les tests critiques passent.
- Défauts bloquants/majeurs corrigés ou documentés avec décision.
- Rapport de couverture démontré >= 80%.

## 10) Outils utilisés

- `Jest` (runner + assertions + mocks),
- `jest-preset-angular`,
- `@angular/core/testing` (`TestBed`, `ComponentFixture`),
- `@angular/common/http/testing` (`HttpTestingController`, `provideHttpClientTesting`),
- `@angular/router` testing providers (`provideRouter`),
- spies/mocks Jest (`jest.fn`, `jest.spyOn`).

