import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Login } from '../models/Login';
import { Token } from '../models/Token';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private httpClient: HttpClient) { }

  login(user: Login) {
    return this.httpClient.post<Token>('/api/login', user)
      .pipe(tap(res => this.setSession(res)));
  }

  private setSession(authResult: Token) {
    const expiresAt = moment().add(authResult.expiresIn, 'second');
    localStorage.setItem('id_token', authResult.idToken);
    localStorage.setItem("expires_at", JSON.stringify(expiresAt.valueOf()) );
  }          

  logout() {
    localStorage.removeItem("id_token");
    localStorage.removeItem("expires_at");
  }

  public isLoggedIn() {
    return moment().isBefore(this.getExpiration());
  }

  isLoggedOut() {
    return !this.isLoggedIn();
  }

  getExpiration() {
    const expiresAt = JSON.parse(localStorage.getItem('expires_at') || '0');
    return moment(expiresAt);
  }    
}
