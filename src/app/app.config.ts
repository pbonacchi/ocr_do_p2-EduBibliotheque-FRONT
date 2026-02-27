import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import {provideHttpClient, withInterceptors} from '@angular/common/http';
import { authInterceptor } from './core/security/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    // ajout de l'authentification interceptor pour ajouter le token d'authentification à chaque requete HTTP
    provideHttpClient(withInterceptors([authInterceptor])),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes)
  ]

};
