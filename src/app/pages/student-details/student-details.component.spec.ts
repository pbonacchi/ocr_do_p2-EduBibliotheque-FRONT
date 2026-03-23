import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { StudentDetailsComponent } from './student-details.component';
import { UserService } from '../../core/service/user.service';
import { Student } from '../../core/models/Student';

describe('StudentDetailsComponent', () => {
  let component: StudentDetailsComponent;
  let fixture: ComponentFixture<StudentDetailsComponent>;
  let userServiceMock: {
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
    notifyStudentChanged: jest.Mock;
  };
  const currentStudent: Student = { id: 1, firstName: 'Ada', lastName: 'Lovelace', login: 'ada' };

  beforeEach(async () => {
    userServiceMock = {
      create: jest.fn().mockReturnValue(of({ id: 2, firstName: 'Alan', lastName: 'Turing', login: 'alan' })),
      update: jest.fn().mockReturnValue(of({})),
      delete: jest.fn().mockReturnValue(of({})),
      notifyStudentChanged: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [StudentDetailsComponent],
      providers: [
        { provide: UserService, useValue: userServiceMock },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentDetailsComponent);
    component = fixture.componentInstance;
    component.currentStudent = currentStudent;
    component.isCreating = false;
    fixture.detectChanges();
  });

  it('should create', () => {
    // UT-CMP-STD-00
    // But : vérifier que StudentDetailsComponent est correctement instancié.
    // Entrants : aucun.
    // Résultat attendu : le composant est créé.
    expect(component).toBeTruthy();
  });

  it('UT-CMP-STD-01: should create student and notify create event on success', () => {
    // UT-CMP-STD-01
    // But : vérifier le parcours de création d'étudiant (succès).
    // Entrants : isCreating=true + formulaire valide + create() succès.
    // Résultat attendu : create appelé, message succès, form reset, notifyStudentChanged(create).
    component.isCreating = true;
    component.studentForm.setValue({ firstName: 'Alan', lastName: 'Turing', login: 'alan' });

    component.createStudent();

    expect(userServiceMock.create).toHaveBeenCalledWith({
      firstName: 'Alan',
      lastName: 'Turing',
      login: 'alan',
    });
    expect(component.message).toBe('Student created successfully');
    expect(component.isEditing).toBe(false);
    expect(userServiceMock.notifyStudentChanged).toHaveBeenCalledWith({
      action: 'create',
      student: { id: 2, firstName: 'Alan', lastName: 'Turing', login: 'alan' },
    });
  });

  it('UT-CMP-STD-02: should show error on create when backend returns 401', () => {
    // UT-CMP-STD-02
    // But : vérifier la gestion d'erreur de création (401).
    // Entrants : formulaire valide + create() erreur 401.
    // Résultat attendu : message d'erreur et aucune notification create.
    userServiceMock.create.mockReturnValueOnce(
      throwError(() => ({ status: 401, error: { message: 'Unauthorized' } }))
    );
    component.isCreating = true;
    component.studentForm.setValue({ firstName: 'Alan', lastName: 'Turing', login: 'alan' });

    component.createStudent();

    expect(component.message).toContain('Error creating student: Unauthorized');
    expect(userServiceMock.notifyStudentChanged).not.toHaveBeenCalledWith(
      expect.objectContaining({ action: 'create' })
    );
  });

  it('UT-CMP-STD-03: should show error on create when backend returns 400', () => {
    // UT-CMP-STD-03
    // But : vérifier la gestion d'erreur de création (400).
    // Entrants : formulaire valide + create() erreur 400.
    // Résultat attendu : message d'erreur et aucune notification create.
    userServiceMock.create.mockReturnValueOnce(
      throwError(() => ({ status: 400, error: { message: 'Bad request' } }))
    );
    component.isCreating = true;
    component.studentForm.setValue({ firstName: 'Alan', lastName: 'Turing', login: 'alan' });

    component.createStudent();

    expect(component.message).toContain('Error creating student: Bad request');
    expect(userServiceMock.notifyStudentChanged).not.toHaveBeenCalledWith(
      expect.objectContaining({ action: 'create' })
    );
  });

  it('UT-CMP-STD-04: should not call create when form is invalid', () => {
    // UT-CMP-STD-04
    // But : vérifier qu'une création invalide n'appelle pas le service.
    // Entrants : formulaire incomplet/invalide.
    // Résultat attendu : aucun appel create().
    component.isCreating = true;
    component.studentForm.setValue({ firstName: '', lastName: '', login: '' });

    component.createStudent();

    expect(userServiceMock.create).not.toHaveBeenCalled();
  });

  it('UT-CMP-STD-05: should update student and notify update event on success', () => {
    // UT-CMP-STD-05
    // But : vérifier le parcours de mise à jour d'étudiant (succès).
    // Entrants : currentStudent.id présent + formulaire valide + update() succès.
    // Résultat attendu : update appelé, message succès, notifyStudentChanged(update).
    component.currentStudent = { ...currentStudent };
    component.studentForm.setValue({ firstName: 'Ada', lastName: 'Byron', login: 'ada' });

    component.updateStudent();

    expect(userServiceMock.update).toHaveBeenCalledWith(1, {
      id: 1,
      firstName: 'Ada',
      lastName: 'Byron',
      login: 'ada',
    });
    expect(component.message).toBe('Student updated successfully');
    expect(userServiceMock.notifyStudentChanged).toHaveBeenCalledWith({
      action: 'update',
      student: {
        id: 1,
        firstName: 'Ada',
        lastName: 'Byron',
        login: 'ada',
      },
    });
  });

  it('UT-CMP-STD-06: should show error on update when backend returns 401', () => {
    // UT-CMP-STD-06
    // But : vérifier la gestion d'erreur de mise à jour (401).
    // Entrants : formulaire valide + update() erreur 401.
    // Résultat attendu : message d'erreur et aucune notification update.
    userServiceMock.update.mockReturnValueOnce(
      throwError(() => ({ status: 401, error: { message: 'Unauthorized' } }))
    );
    component.currentStudent = { ...currentStudent };
    component.studentForm.setValue({ firstName: 'Ada', lastName: 'Byron', login: 'ada' });

    component.updateStudent();

    expect(component.message).toContain('Error updating student: Unauthorized');
    expect(userServiceMock.notifyStudentChanged).not.toHaveBeenCalledWith(
      expect.objectContaining({ action: 'update' })
    );
  });

  it('UT-CMP-STD-07: should show error on update when backend returns 400', () => {
    // UT-CMP-STD-07
    // But : vérifier la gestion d'erreur de mise à jour (400).
    // Entrants : formulaire valide + update() erreur 400.
    // Résultat attendu : message d'erreur et aucune notification update.
    userServiceMock.update.mockReturnValueOnce(
      throwError(() => ({ status: 400, error: { message: 'Bad request' } }))
    );
    component.currentStudent = { ...currentStudent };
    component.studentForm.setValue({ firstName: 'Ada', lastName: 'Byron', login: 'ada' });

    component.updateStudent();

    expect(component.message).toContain('Error updating student: Bad request');
    expect(userServiceMock.notifyStudentChanged).not.toHaveBeenCalledWith(
      expect.objectContaining({ action: 'update' })
    );
  });

  it('UT-CMP-STD-08: should not call update when id is missing or form invalid', () => {
    // UT-CMP-STD-08
    // But : vérifier qu'une mise à jour invalide n'appelle pas le service.
    // Entrants : currentStudent sans id puis formulaire invalide.
    // Résultat attendu : aucun appel update().
    component.currentStudent = { firstName: 'x', lastName: 'y', login: 'z' };
    component.studentForm.setValue({ firstName: 'x', lastName: 'y', login: 'z' });
    component.updateStudent();

    component.currentStudent = { ...currentStudent };
    component.studentForm.setValue({ firstName: '', lastName: '', login: '' });
    component.updateStudent();

    expect(userServiceMock.update).not.toHaveBeenCalled();
  });

  it('UT-CMP-STD-09: should delete student and notify delete event on success', () => {
    // UT-CMP-STD-09
    // But : vérifier le parcours de suppression d'étudiant (succès).
    // Entrants : currentStudent.id présent + delete() succès.
    // Résultat attendu : delete appelé, message succès, notifyStudentChanged(delete).
    component.currentStudent = { ...currentStudent };

    component.deleteStudent();

    expect(userServiceMock.delete).toHaveBeenCalledWith(1);
    expect(component.message).toBe('Student deleted successfully');
    expect(userServiceMock.notifyStudentChanged).toHaveBeenCalledWith({ action: 'delete', id: 1 });
  });

  it('UT-CMP-STD-10: should show error on delete when backend returns 401', () => {
    // UT-CMP-STD-10
    // But : vérifier la gestion d'erreur de suppression (401).
    // Entrants : currentStudent.id présent + delete() erreur 401.
    // Résultat attendu : message d'erreur et aucune notification delete.
    userServiceMock.delete.mockReturnValueOnce(
      throwError(() => ({ status: 401, error: { message: 'Unauthorized' } }))
    );
    component.currentStudent = { ...currentStudent };

    component.deleteStudent();

    expect(component.message).toContain('Error deleting student: Unauthorized');
    expect(userServiceMock.notifyStudentChanged).not.toHaveBeenCalledWith(
      expect.objectContaining({ action: 'delete' })
    );
  });

  it('UT-CMP-STD-11: should show error on delete when backend returns 400', () => {
    // UT-CMP-STD-11
    // But : vérifier la gestion d'erreur de suppression (400).
    // Entrants : currentStudent.id présent + delete() erreur 400.
    // Résultat attendu : message d'erreur et aucune notification delete.
    userServiceMock.delete.mockReturnValueOnce(
      throwError(() => ({ status: 400, error: { message: 'Bad request' } }))
    );
    component.currentStudent = { ...currentStudent };

    component.deleteStudent();

    expect(component.message).toContain('Error deleting student: Bad request');
    expect(userServiceMock.notifyStudentChanged).not.toHaveBeenCalledWith(
      expect.objectContaining({ action: 'delete' })
    );
  });

  it('UT-CMP-STD-12: should not call delete when id is missing', () => {
    // UT-CMP-STD-12
    // But : vérifier qu'une suppression invalide n'appelle pas le service.
    // Entrants : currentStudent sans id.
    // Résultat attendu : aucun appel delete().
    component.currentStudent = { firstName: 'x', lastName: 'y', login: 'z' };

    component.deleteStudent();

    expect(userServiceMock.delete).not.toHaveBeenCalled();
  });

  it('UT-CMP-STD-13: should emit createCancelled when cancelEdit is called in creation mode', () => {
    // UT-CMP-STD-13
    // But : vérifier l'émission createCancelled lors de l'annulation en mode création.
    // Entrants : isCreating=true.
    // Résultat attendu : événement createCancelled émis.
    const emitSpy = jest.spyOn(component.createCancelled, 'emit');
    component.isCreating = true;
    component.isEditing = true;

    component.cancelEdit();

    expect(component.isEditing).toBe(false);
    expect(emitSpy).toHaveBeenCalled();
  });
});
