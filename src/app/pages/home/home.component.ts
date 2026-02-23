import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MaterialModule } from '../../shared/material.module';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  constructor(private router: Router) {}

  onNavigateToRegister(): void {
    this.router.navigateByUrl('/register');
  }

  onNavigateToLogin(): void {
    this.router.navigateByUrl('/login');
  }

}
