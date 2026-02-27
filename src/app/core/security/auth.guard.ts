import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    if (this.auth.isLoggedIn()) {
      return true;
    }
    // utilisateur non authentifié => redirection vers login page en l'informant de l'URL demandée par l'utilisateur.
    // utilisation de createUrlTree pour encodage correct des params et éviter les problèmes de double encodage
    return this.router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
  }
}