import { TestBed } from '@angular/core/testing';

import { UserService } from './user.service';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Register } from '../models/Register';
import { Student } from '../models/Student';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ]
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('UT-SVC-USR-01: should call POST /api/register and return success response', () => {
    // UT-SVC-USR-01
    // But : vérifier que UserService.register envoie bien un POST /api/register.
    // Entrants : payload Register valide (firstName, lastName, login, password).
    // Résultat attendu : requête HTTP POST avec le bon body, puis propagation de la réponse de succès.
    const payload: Register = {
      firstName: 'Ada',
      lastName: 'Lovelace',
      login: 'ada',
      password: 'secret',
    };
    const apiResponse = { message: 'created' };
    let receivedResponse: { message: string } | undefined;

    service.register(payload).subscribe((response) => {
      receivedResponse = response;
    });

    const request = httpMock.expectOne('/api/register');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);

    request.flush(apiResponse);
    expect(receivedResponse).toEqual(apiResponse);
  });

  it('UT-SVC-USR-02: should propagate HTTP 400 error from register endpoint', () => {
    // UT-SVC-USR-02
    // But : vérifier que UserService.register propage une erreur backend 400.
    // Entrants : payload Register invalide (cas représentatif).
    // Résultat attendu : erreur HTTP 400 reçue par l'abonné (status + message backend).
    const invalidPayload = {
      firstName: '',
      lastName: '',
      login: '',
      password: '',
    } as Register;
    const backendError = { message: 'Bad request' };
    let receivedStatus: number | undefined;
    let receivedMessage: string | undefined;

    service.register(invalidPayload).subscribe({
      next: () => {
        fail('La souscription ne doit pas passer dans next pour un cas 400.');
      },
      error: (error) => {
        receivedStatus = error.status;
        receivedMessage = error.error.message;
      },
    });

    const request = httpMock.expectOne('/api/register');
    expect(request.request.method).toBe('POST');
    request.flush(backendError, { status: 400, statusText: 'Bad Request' });

    expect(receivedStatus).toBe(400);
    expect(receivedMessage).toBe('Bad request');
  });

  it('UT-SVC-USR-03: should call GET /api/students and return students list', () => {
    // UT-SVC-USR-03
    // But : vérifier que UserService.getAll envoie un GET /api/students.
    // Entrants : aucune donnée d'entrée.
    // Résultat attendu : requête HTTP GET et propagation de la liste d'étudiants reçue.
    const students: Student[] = [
      { id: 1, firstName: 'Ada', lastName: 'Lovelace', login: 'ada' },
      { id: 2, firstName: 'Alan', lastName: 'Turing', login: 'alan' },
    ];
    let receivedStudents: Student[] | undefined;

    service.getAll().subscribe((response) => {
      receivedStudents = response;
    });

    const request = httpMock.expectOne('/api/students');
    expect(request.request.method).toBe('GET');
    request.flush(students);

    expect(receivedStudents).toEqual(students);
  });

  it('UT-SVC-USR-04: should propagate HTTP 401 error from getAll endpoint', () => {
    // UT-SVC-USR-04
    // But : vérifier que UserService.getAll propage une erreur backend 401.
    // Entrants : aucune donnée d'entrée (cas non authentifié).
    // Résultat attendu : erreur HTTP 401 propagée à l'abonné.
    let receivedStatus: number | undefined;

    service.getAll().subscribe({
      next: () => fail('La souscription ne doit pas passer dans next pour un cas 401.'),
      error: (error) => {
        receivedStatus = error.status;
      },
    });

    const request = httpMock.expectOne('/api/students');
    expect(request.request.method).toBe('GET');
    request.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

    expect(receivedStatus).toBe(401);
  });

  it('UT-SVC-USR-05: should call GET /api/students/:id and return one student', () => {
    // UT-SVC-USR-05
    // But : vérifier que UserService.get(id) envoie un GET /api/students/:id.
    // Entrants : id valide.
    // Résultat attendu : requête HTTP GET sur la bonne URL et propagation de l'étudiant reçu.
    const studentId = 7;
    const student: Student = { id: studentId, firstName: 'Grace', lastName: 'Hopper', login: 'grace' };
    let receivedStudent: Student | undefined;

    service.get(studentId).subscribe((response) => {
      receivedStudent = response;
    });

    const request = httpMock.expectOne(`/api/students/${studentId}`);
    expect(request.request.method).toBe('GET');
    request.flush(student);

    expect(receivedStudent).toEqual(student);
  });

  it('UT-SVC-USR-06: should propagate HTTP 400 error from get(id) endpoint', () => {
    // UT-SVC-USR-06
    // But : vérifier que UserService.get(id) propage une erreur backend 400.
    // Entrants : id invalide/inexistant (cas représentatif).
    // Résultat attendu : erreur HTTP 400 propagée à l'abonné.
    const unknownId = 999;
    let receivedStatus: number | undefined;

    service.get(unknownId).subscribe({
      next: () => fail('La souscription ne doit pas passer dans next pour un cas 400.'),
      error: (error) => {
        receivedStatus = error.status;
      },
    });

    const request = httpMock.expectOne(`/api/students/${unknownId}`);
    expect(request.request.method).toBe('GET');
    request.flush({ message: 'Bad request' }, { status: 400, statusText: 'Bad Request' });

    expect(receivedStatus).toBe(400);
  });

  it('UT-SVC-USR-07: should propagate HTTP 401 error from get(id) endpoint', () => {
    // UT-SVC-USR-07
    // But : vérifier que UserService.get(id) propage une erreur backend 401.
    // Entrants : id quelconque, utilisateur non authentifié.
    // Résultat attendu : erreur HTTP 401 propagée à l'abonné.
    const studentId = 10;
    let receivedStatus: number | undefined;

    service.get(studentId).subscribe({
      next: () => fail('La souscription ne doit pas passer dans next pour un cas 401.'),
      error: (error) => {
        receivedStatus = error.status;
      },
    });

    const request = httpMock.expectOne(`/api/students/${studentId}`);
    expect(request.request.method).toBe('GET');
    request.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

    expect(receivedStatus).toBe(401);
  });

  it('UT-SVC-USR-08: should call POST /api/students and return created student', () => {
    // UT-SVC-USR-08
    // But : vérifier que UserService.create envoie un POST /api/students.
    // Entrants : payload étudiant valide.
    // Résultat attendu : requête HTTP POST avec body conforme et propagation de l'étudiant créé.
    const payload = { firstName: 'Katherine', lastName: 'Johnson', login: 'kjohnson' };
    const createdStudent: Student = { id: 12, ...payload };
    let receivedStudent: Student | undefined;

    service.create(payload).subscribe((response) => {
      receivedStudent = response;
    });

    const request = httpMock.expectOne('/api/students');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    request.flush(createdStudent);

    expect(receivedStudent).toEqual(createdStudent);
  });

  it('UT-SVC-USR-09: should propagate HTTP 400 error from create endpoint', () => {
    // UT-SVC-USR-09
    // But : vérifier que UserService.create propage une erreur backend 400.
    // Entrants : payload invalide (cas représentatif).
    // Résultat attendu : erreur HTTP 400 propagée à l'abonné.
    let receivedStatus: number | undefined;

    service.create({ firstName: '', lastName: '', login: '' }).subscribe({
      next: () => fail('La souscription ne doit pas passer dans next pour un cas 400.'),
      error: (error) => {
        receivedStatus = error.status;
      },
    });

    const request = httpMock.expectOne('/api/students');
    expect(request.request.method).toBe('POST');
    request.flush({ message: 'Bad request' }, { status: 400, statusText: 'Bad Request' });

    expect(receivedStatus).toBe(400);
  });

  it('UT-SVC-USR-10: should propagate HTTP 401 error from create endpoint', () => {
    // UT-SVC-USR-10
    // But : vérifier que UserService.create propage une erreur backend 401.
    // Entrants : payload valide, utilisateur non authentifié.
    // Résultat attendu : erreur HTTP 401 propagée à l'abonné.
    let receivedStatus: number | undefined;

    service.create({ firstName: 'Linus', lastName: 'Torvalds', login: 'linus' }).subscribe({
      next: () => fail('La souscription ne doit pas passer dans next pour un cas 401.'),
      error: (error) => {
        receivedStatus = error.status;
      },
    });

    const request = httpMock.expectOne('/api/students');
    expect(request.request.method).toBe('POST');
    request.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

    expect(receivedStatus).toBe(401);
  });

  it('UT-SVC-USR-11: should call PUT /api/students/:id and return success response', () => {
    // UT-SVC-USR-11
    // But : vérifier que UserService.update envoie un PUT /api/students/:id.
    // Entrants : id valide + payload étudiant valide.
    // Résultat attendu : requête HTTP PUT avec body conforme et propagation de la réponse backend.
    const studentId = 5;
    const payload = { firstName: 'Margaret', lastName: 'Hamilton', login: 'mhamilton' };
    const apiResponse = { message: 'updated' };
    let receivedResponse: { message: string } | undefined;

    service.update(studentId, payload).subscribe((response) => {
      receivedResponse = response;
    });

    const request = httpMock.expectOne(`/api/students/${studentId}`);
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual(payload);
    request.flush(apiResponse);

    expect(receivedResponse).toEqual(apiResponse);
  });

  it('UT-SVC-USR-12: should propagate HTTP 400 error from update endpoint', () => {
    // UT-SVC-USR-12
    // But : vérifier que UserService.update propage une erreur backend 400.
    // Entrants : id ou payload invalide (cas représentatif).
    // Résultat attendu : erreur HTTP 400 propagée à l'abonné.
    const studentId = 5;
    let receivedStatus: number | undefined;

    service.update(studentId, { firstName: '', lastName: '', login: '' }).subscribe({
      next: () => fail('La souscription ne doit pas passer dans next pour un cas 400.'),
      error: (error) => {
        receivedStatus = error.status;
      },
    });

    const request = httpMock.expectOne(`/api/students/${studentId}`);
    expect(request.request.method).toBe('PUT');
    request.flush({ message: 'Bad request' }, { status: 400, statusText: 'Bad Request' });

    expect(receivedStatus).toBe(400);
  });

  it('UT-SVC-USR-13: should propagate HTTP 401 error from update endpoint', () => {
    // UT-SVC-USR-13
    // But : vérifier que UserService.update propage une erreur backend 401.
    // Entrants : id valide + payload valide, utilisateur non authentifié.
    // Résultat attendu : erreur HTTP 401 propagée à l'abonné.
    const studentId = 5;
    let receivedStatus: number | undefined;

    service.update(studentId, { firstName: 'Tim', lastName: 'Berners-Lee', login: 'tbl' }).subscribe({
      next: () => fail('La souscription ne doit pas passer dans next pour un cas 401.'),
      error: (error) => {
        receivedStatus = error.status;
      },
    });

    const request = httpMock.expectOne(`/api/students/${studentId}`);
    expect(request.request.method).toBe('PUT');
    request.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

    expect(receivedStatus).toBe(401);
  });

  it('UT-SVC-USR-14: should call DELETE /api/students/:id and return success response', () => {
    // UT-SVC-USR-14
    // But : vérifier que UserService.delete envoie un DELETE /api/students/:id.
    // Entrants : id valide.
    // Résultat attendu : requête HTTP DELETE sur la bonne URL et propagation de la réponse backend.
    const studentId = 3;
    const apiResponse = { message: 'deleted' };
    let receivedResponse: { message: string } | undefined;

    service.delete(studentId).subscribe((response) => {
      receivedResponse = response;
    });

    const request = httpMock.expectOne(`/api/students/${studentId}`);
    expect(request.request.method).toBe('DELETE');
    request.flush(apiResponse);

    expect(receivedResponse).toEqual(apiResponse);
  });

  it('UT-SVC-USR-15: should propagate HTTP 400 error from delete endpoint', () => {
    // UT-SVC-USR-15
    // But : vérifier que UserService.delete propage une erreur backend 400.
    // Entrants : id invalide/inexistant (cas représentatif).
    // Résultat attendu : erreur HTTP 400 propagée à l'abonné.
    const unknownId = 404;
    let receivedStatus: number | undefined;

    service.delete(unknownId).subscribe({
      next: () => fail('La souscription ne doit pas passer dans next pour un cas 400.'),
      error: (error) => {
        receivedStatus = error.status;
      },
    });

    const request = httpMock.expectOne(`/api/students/${unknownId}`);
    expect(request.request.method).toBe('DELETE');
    request.flush({ message: 'Bad request' }, { status: 400, statusText: 'Bad Request' });

    expect(receivedStatus).toBe(400);
  });

  it('UT-SVC-USR-16: should propagate HTTP 401 error from delete endpoint', () => {
    // UT-SVC-USR-16
    // But : vérifier que UserService.delete propage une erreur backend 401.
    // Entrants : id quelconque, utilisateur non authentifié.
    // Résultat attendu : erreur HTTP 401 propagée à l'abonné.
    const studentId = 6;
    let receivedStatus: number | undefined;

    service.delete(studentId).subscribe({
      next: () => fail('La souscription ne doit pas passer dans next pour un cas 401.'),
      error: (error) => {
        receivedStatus = error.status;
      },
    });

    const request = httpMock.expectOne(`/api/students/${studentId}`);
    expect(request.request.method).toBe('DELETE');
    request.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

    expect(receivedStatus).toBe(401);
  });

  it('UT-SVC-USR-17: should emit create action on studentChanged$', (done) => {
    // UT-SVC-USR-17
    // But : vérifier que notifyStudentChanged émet l'action "create".
    // Entrants : action create avec un étudiant.
    // Résultat attendu : studentChanged$ émet exactement l'action transmise.
    const action = {
      action: 'create' as const,
      student: { id: 1, firstName: 'Ada', lastName: 'Lovelace', login: 'ada' },
    };

    service.studentChanged$.subscribe((receivedAction) => {
      expect(receivedAction).toEqual(action);
      done();
    });

    service.notifyStudentChanged(action);
  });

  it('UT-SVC-USR-18: should emit update action on studentChanged$', (done) => {
    // UT-SVC-USR-18
    // But : vérifier que notifyStudentChanged émet l'action "update".
    // Entrants : action update avec un étudiant.
    // Résultat attendu : studentChanged$ émet exactement l'action transmise.
    const action = {
      action: 'update' as const,
      student: { id: 2, firstName: 'Alan', lastName: 'Turing', login: 'alan' },
    };

    service.studentChanged$.subscribe((receivedAction) => {
      expect(receivedAction).toEqual(action);
      done();
    });

    service.notifyStudentChanged(action);
  });

  it('UT-SVC-USR-19: should emit delete action on studentChanged$', (done) => {
    // UT-SVC-USR-19
    // But : vérifier que notifyStudentChanged émet l'action "delete".
    // Entrants : action delete avec un id.
    // Résultat attendu : studentChanged$ émet exactement l'action transmise.
    const action = {
      action: 'delete' as const,
      id: 3,
    };

    service.studentChanged$.subscribe((receivedAction) => {
      expect(receivedAction).toEqual(action);
      done();
    });

    service.notifyStudentChanged(action);
  });
});
