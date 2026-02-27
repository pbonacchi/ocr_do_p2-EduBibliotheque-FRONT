import { Routes } from '@angular/router';
import {RegisterComponent} from './pages/register/register.component';
import {LoginComponent} from './pages/login/login.component';
import {AppComponent} from './app.component';
import { HomeComponent } from './pages/home/home.component';
import { MaBibliComponent } from './pages/ma-bibli/ma-bibli.component';
import { AuthGuard } from './core/security/auth.guard';
import { StudentsListComponent } from './pages/students-list/students-list.component';
import { StudentDetailsComponent } from './pages/student-details/student-details.component';

export const routes: Routes = [
/*  { path: '', component: AppComponent }*/
  { path: '', component: HomeComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'ma-bibli', component: MaBibliComponent, canActivate: [AuthGuard] },
  { path: 'students', component: StudentsListComponent, canActivate: [AuthGuard] },
  { path: 'students/:id', component: StudentDetailsComponent, canActivate: [AuthGuard] }
];
