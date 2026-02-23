import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { MaterialModule } from '../../shared/material.module';
import { CommonModule } from '@angular/common';
import { UserService } from '../../core/service/user.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Login } from '../../core/models/Login';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/security/auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, MaterialModule, RouterLink],
  templateUrl: './login.component.html',
  standalone: true,
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  loginForm: FormGroup = new FormGroup({});
  submitted: boolean = false;
  loading: boolean = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  
  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/ma-bibli']);
      return;
    }
    this.loginForm = this.formBuilder.group(
      {
        login: ['', Validators.required],
        password: ['', Validators.required]
      },
    );
  }

  get form() {
    return this.loginForm.controls;
  }

  onSubmit(): void {
    this.errorMessage = null;
    this.successMessage = null;
    this.submitted = true;

    if (this.loginForm.invalid) {
      this.loading = false;
      return;
    }

    const loginUser: Login = {
      login: this.loginForm.get('login')?.value,
      password: this.loginForm.get('password')?.value
    };
    this.loading = true;
    this.authService.login(loginUser)
      .subscribe({
        next: () => {
          this.successMessage = 'Authentification réussie, vous allez être redirigé·e vers votre bibliothèque...';
          setTimeout(() => this.router.navigate(['/ma-bibli']), 2000);
        },
        error: (err) => {
          const msg = err && err.error && err.error.message ? err.error.message : 'Erreur pendant l\'authentification.';
          this.errorMessage = msg;
          this.loading = false;
        }
    });
  }

  onReset(): void {
    if (this.loading) { return; }
    this.loading = false;
    this.submitted = false;
    this.loginForm.reset();
    this.errorMessage = null;
    this.successMessage = null;
  }

}
