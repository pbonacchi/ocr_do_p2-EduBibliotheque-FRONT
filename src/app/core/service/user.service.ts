import { Injectable } from '@angular/core';
import { Register } from '../models/Register';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { Student } from '../models/Student';

export type StudentAction = 
  | { action: 'create'; student: Student }
  | { action: 'update'; student: Student }
  | { action: 'delete'; id: number };

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private studentChangedSubject = new Subject<StudentAction>();
  public studentChanged$ = this.studentChangedSubject.asObservable();

  constructor(private httpClient: HttpClient) { }

  register(user: Register): Observable<any> {
    return this.httpClient.post('/api/register', user);
  }

  getAll(): Observable<Student[]> {
    return this.httpClient.get<Student[]>('/api/students');
  }

  get(id: any): Observable<Student> {
    return this.httpClient.get<Student>(`/api/students/${id}`);
  }

  create(data: any): Observable<Student> {
    return this.httpClient.post<Student>('/api/students', data);
  }

  update(id: any, data: any): Observable<any> {
    return this.httpClient.put(`/api/students/${id}`, data);
  }

  delete(id: any): Observable<any> {
    return this.httpClient.delete(`/api/students/${id}`);
  }

  notifyStudentChanged(action: StudentAction): void {
    this.studentChangedSubject.next(action);
  }

}
