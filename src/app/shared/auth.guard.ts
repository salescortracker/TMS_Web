import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/** Blocks a route unless the user is logged in AND holds the given role. */
export function roleGuard(role: string): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (!auth.isLoggedIn) {
      auth.logout();
      return router.parseUrl('/login');
    }
    if (auth.currentUser()?.mustChangePassword) {
      return router.parseUrl('/change-password');
    }
    if (!auth.hasRole(role)) {
      return router.parseUrl(auth.homeRoute());
    }
    return true;
  };
}

/** Blocks a route unless the user is logged in (any role). */
export const loggedInGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.isLoggedIn ? true : inject(Router).parseUrl('/login');
};
