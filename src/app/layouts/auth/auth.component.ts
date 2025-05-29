import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate, CanActivateChild {
  constructor(private router: Router) {}

  private check(): boolean {
    if (localStorage.getItem('isLoggedIn') === 'true') return true;
    this.router.navigate(['/login']);
    return false;
  }

  canActivate(): boolean { return this.check(); }
  canActivateChild(): boolean { return this.check(); }
}
