import { ApplicationConfig, inject } from '@angular/core';
import { Route, UrlSegment, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideAppInitSetUserStorage } from './provide-check-auth-token';
import { UserInfoService } from './user-info.service';
import { map } from 'rxjs';

const routes: Route[] = [
  {
    path: '',
    loadComponent: () => import('./listing.component'),
    canMatch: [(_route:Route, _segments:UrlSegment[], userInfoService = inject(UserInfoService)) => userInfoService.user$.pipe(map(value => !!value)) ]
  },
  {
    path: '',
    loadComponent:  ()=>import('./login.component'),
  },
]

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(),
    provideAppInitSetUserStorage()
  ]
};
