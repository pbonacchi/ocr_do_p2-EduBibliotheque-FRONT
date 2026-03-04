import { TestBed } from '@angular/core/testing';

import { UserService } from './user.service';
import {provideHttpClient} from '@angular/common/http';
import { authInterceptor } from '../security/auth.interceptor';

describe('UserService', () => {
  let service: UserService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient({
          interceptors: [ authInterceptor ]
        }),
      ]
    });
    service = TestBed.inject(UserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
