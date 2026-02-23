import { Component } from '@angular/core';
import { AuthService } from '../../core/security/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-ma-bibli',
  imports: [],
  templateUrl: './ma-bibli.component.html',
  styleUrl: './ma-bibli.component.css'
})
export class MaBibliComponent {
  constructor(private authService: AuthService, private router: Router) {
    console.log('Logged in ? ' + this.authService.isLoggedIn());
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
