import { Component, Input, Output, OnInit, OnChanges, SimpleChanges, EventEmitter, DestroyRef, inject } from '@angular/core';
import { UserService } from '../../core/service/user.service';
import { Student } from '../../core/models/Student';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Register } from '../../core/models/Register';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-student-details',
  standalone: true,
  imports: [ ReactiveFormsModule],
  templateUrl: './student-details.component.html',
  styleUrl: './student-details.component.css'
})
export class StudentDetailsComponent implements OnChanges {
  @Input() currentStudent!: Student;
  @Input() isCreating = false;
  @Output() createCancelled = new EventEmitter<void>();
  studentForm!: FormGroup;
  private destroyRef = inject(DestroyRef);

  isEditing = false;
  message = '';

  constructor(
    private userService: UserService,
    //private route: ActivatedRoute,
    //private router: Router,
    private fb: FormBuilder
  ) {
    this.studentForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      login: ['', Validators.required]
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['currentStudent'] || changes['isCreating']) {
      if (this.isCreating) {
        // Mode création: afficher le formulaire vide
        this.isEditing = true;
        this.studentForm.reset();
        this.message = '';
      } else if (this.currentStudent && this.currentStudent.id) {
        // Mode lecture: afficher les détails
        this.studentForm.patchValue(this.currentStudent);
        this.isEditing = false;
      }
    }
  }


/*  ngOnInit(): void {
    this.studentForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      login: ['', Validators.required]
    });
    
    //if (!this.viewMode) {
      const id = Number(this.route.snapshot.params['id']);
      this.message = '';
      if (id) {
        this.getStudent(id);
      }
    //} else if (this.currentStudent) {
    //  this.studentForm.patchValue(this.currentStudent);
    //}
  }

  getStudent(id: number): void {
    this.userService.get(id)
      .subscribe({
        next: (data) => {
          this.currentStudent = data;
          //this.studentForm.patchValue(data);
        },
        error: (e) => console.error(e)
      });
  } */

  enableEdit(): void {
    this.studentForm.patchValue(this.currentStudent);
    this.isEditing = true;
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.studentForm.reset();
    if (this.isCreating) {
      this.createCancelled.emit();
    }
  }

  createStudent(): void {
    if (this.studentForm.invalid) {
      return;
    }

    const newStudent: Student = this.studentForm.value;

    this.userService.create(newStudent)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (createdStudent) => {
          this.message = 'Student created successfully';
          this.isEditing = false;
          this.studentForm.reset();
          this.userService.notifyStudentChanged({ action: 'create', student: createdStudent });
        },
        error: (e) => this.message = 'Error creating student: ' + e.error.message
      },
    );
  }

  updateStudent(): void {
    if (this.studentForm.invalid || !this.currentStudent?.id) {
      return;
    }

    const updatedStudent: Student = {
      ...this.currentStudent,
      ...this.studentForm.value
    };

    this.userService.update(this.currentStudent.id, updatedStudent)
      .subscribe({
        next: () => {
          this.currentStudent = updatedStudent;
          this.isEditing = false;
          this.message = 'Student updated successfully';
          this.userService.notifyStudentChanged({ action: 'update', student: updatedStudent });
        },
        error: (e) => this.message = 'Error updating student: ' + e.error.message
      });
  }

  deleteStudent(): void {
    if (!this.currentStudent?.id) {
      return;
    }

    this.userService.delete(this.currentStudent.id)
      .subscribe({
        next: () => {
          this.message = 'Student deleted successfully';
          if (!this.currentStudent.id) return;
          this.userService.notifyStudentChanged({ action: 'delete', id: this.currentStudent.id });
          this.currentStudent = undefined as any;
        },
        error: (e) => this.message = 'Error deleting student: ' + e.error.message
      });
  }
}
