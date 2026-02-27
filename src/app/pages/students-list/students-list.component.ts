import { Component, OnInit, OnDestroy } from '@angular/core';
import { Student } from '../../core/models/Student';
import { UserService } from '../../core/service/user.service';
import { StudentDetailsComponent } from "../student-details/student-details.component";
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-students-list',
  standalone: true,
  imports: [StudentDetailsComponent],
  templateUrl: './students-list.component.html',
  styleUrl: './students-list.component.css'
})
export class StudentsListComponent implements OnInit, OnDestroy {
  students?: Student[];
  currentStudent: Student = {
    firstName: '',
    lastName: '',
    login: ''
  };
  currentIndex = -1;
  isCreatingStudent = false;
  private destroy$ = new Subject<void>();
  
  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.retrieveStudents();
    this.subscribeToStudentUpdates();
  }

  private subscribeToStudentUpdates(): void {
    this.userService.studentChanged$
      .pipe(takeUntil(this.destroy$))
      .subscribe((action) => {
        if (!this.students) return;

        if (action.action === 'create') {
          this.students.push(action.student);
          this.students = [...this.students];
          this.isCreatingStudent = false;
          this.setActiveStudent(action.student, this.students.length - 1);
        } else if (action.action === 'update') {
          const index = this.students.findIndex(s => s.id === action.student.id);
          if (index !== -1) {
            this.students[index] = action.student;
            this.students = [...this.students];
          }
        } else if (action.action === 'delete') {
          this.students = this.students.filter(s => s.id !== action.id);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  retrieveStudents(): void {
    this.userService.getAll().subscribe({
      next: (data) => {
        this.students = data;
      },
      error: (e) => console.error(e)
    });
  }

  startCreatingStudent(): void {
    this.isCreatingStudent = true;
    this.currentIndex = -1;
  }

  setActiveStudent(student: Student, index: number): void {
    this.currentStudent = student;
    this.currentIndex = index;
    this.isCreatingStudent = false;
  }
}
