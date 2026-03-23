import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';

import { StudentsListComponent } from './students-list.component';
import { UserService } from '../../core/service/user.service';
import { Student } from '../../core/models/Student';
import { StudentAction } from '../../core/service/user.service';

describe('StudentsListComponent', () => {
  let component: StudentsListComponent;
  let fixture: ComponentFixture<StudentsListComponent>;
  let studentChangedSubject: Subject<StudentAction>;
  let userServiceMock: { getAll: jest.Mock; studentChanged$: Subject<StudentAction> };
  const baseStudents: Student[] = [
    { id: 1, firstName: 'Ada', lastName: 'Lovelace', login: 'ada' },
    { id: 2, firstName: 'Alan', lastName: 'Turing', login: 'alan' },
  ];

  beforeEach(async () => {
    studentChangedSubject = new Subject<StudentAction>();
    userServiceMock = {
      getAll: jest.fn().mockReturnValue(of(baseStudents)),
      studentChanged$: studentChangedSubject,
    };

    await TestBed.configureTestingModule({
      imports: [StudentsListComponent],
      providers: [
        { provide: UserService, useValue: userServiceMock },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    // UT-CMP-STL-00
    // But : vérifier que StudentsListComponent est correctement instancié.
    // Entrants : aucun.
    // Résultat attendu : le composant est créé.
    expect(component).toBeTruthy();
  });

  it('UT-CMP-STL-01: should load students list on init', () => {
    // UT-CMP-STL-01
    // But : vérifier le chargement initial de la liste des étudiants.
    // Entrants : service getAll() retourne une liste valide.
    // Résultat attendu : students est alimenté avec les données reçues.
    expect(userServiceMock.getAll).toHaveBeenCalled();
    expect(component.students).toEqual(baseStudents);
  });

  it('UT-CMP-STL-02: should stay stable when getAll returns 401 error', () => {
    // UT-CMP-STL-02
    // But : vérifier la stabilité du composant en cas d'échec getAll (401).
    // Entrants : service getAll() retourne une erreur 401.
    // Résultat attendu : aucun crash et students reste undefined.
    userServiceMock.getAll.mockReturnValueOnce(
      throwError(() => ({ status: 401, error: { message: 'Unauthorized' } }))
    );
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    component.students = undefined;
    expect(() => component.retrieveStudents()).not.toThrow();
    expect(component.students).toBeUndefined();

    consoleSpy.mockRestore();
  });

  it('UT-CMP-STL-03: should append student on create event', () => {
    // UT-CMP-STL-03
    // But : vérifier la mise à jour de la liste sur événement create.
    // Entrants : students initialisé + action create.
    // Résultat attendu : étudiant ajouté, mode création fermé et étudiant sélectionné.
    component.students = [...baseStudents];
    component.isCreatingStudent = true;
    const created: Student = { id: 3, firstName: 'Grace', lastName: 'Hopper', login: 'grace' };

    studentChangedSubject.next({ action: 'create', student: created });

    expect(component.students).toEqual([...baseStudents, created]);
    expect(component.isCreatingStudent).toBe(false);
    expect(component.currentStudent).toEqual(created);
    expect(component.currentIndex).toBe(2);
  });

  it('UT-CMP-STL-04: should replace matching student on update event', () => {
    // UT-CMP-STL-04
    // But : vérifier la mise à jour d'un étudiant existant sur événement update.
    // Entrants : students contenant id cible + action update.
    // Résultat attendu : l'étudiant ciblé est remplacé dans la liste.
    component.students = [...baseStudents];
    const updated: Student = { id: 2, firstName: 'Alan', lastName: 'Mathison Turing', login: 'alan' };

    studentChangedSubject.next({ action: 'update', student: updated });

    expect(component.students?.[1]).toEqual(updated);
  });

  it('UT-CMP-STL-05: should remove student on delete event', () => {
    // UT-CMP-STL-05
    // But : vérifier la suppression d'un étudiant sur événement delete.
    // Entrants : students contenant id cible + action delete.
    // Résultat attendu : l'étudiant est retiré de la liste.
    component.students = [...baseStudents];

    studentChangedSubject.next({ action: 'delete', id: 1 });

    expect(component.students).toEqual([{ id: 2, firstName: 'Alan', lastName: 'Turing', login: 'alan' }]);
  });

  it('UT-CMP-STL-06: should enable creation mode and reset currentIndex', () => {
    // UT-CMP-STL-06
    // But : vérifier l'activation du mode création depuis la liste.
    // Entrants : currentIndex pré-initialisé.
    // Résultat attendu : isCreatingStudent=true et currentIndex=-1.
    component.currentIndex = 3;
    component.startCreatingStudent();

    expect(component.isCreatingStudent).toBe(true);
    expect(component.currentIndex).toBe(-1);
  });
});
