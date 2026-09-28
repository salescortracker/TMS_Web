import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, input, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AdminApi, AppNotification } from '../shared/api/admin.api';
import { AuthService } from '../shared/auth.service';

export interface NavItem {
  label: string;
  path: string;
  disabled?: boolean;
}

@Component({
  imports: [RouterLink, RouterLinkActive, RouterOutlet, DatePipe],
  selector: 'app-layout',
  templateUrl: './layout.html',
})
export class Layout implements OnInit {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly api = inject(AdminApi);

  readonly navItems = input<NavItem[]>([]);
  readonly showNotifications = input(true);

  protected readonly unread = signal(0);
  protected readonly notifications = signal<AppNotification[]>([]);
  protected readonly panelOpen = signal(false);

  protected get userName(): string {
    return this.authService.currentUser()?.fullName ?? '';
  }

  protected get userRole(): string {
    return this.authService.roleTitle();
  }

  protected get userInitial(): string {
    return this.userName.trim().charAt(0).toUpperCase();
  }

  ngOnInit(): void {
    if (this.showNotifications()) {
      this.loadNotifications();
    }
  }

  togglePanel(): void {
    this.panelOpen.update((open) => !open);
    if (this.panelOpen() && this.unread() > 0) {
      this.api.markAllNotificationsRead().subscribe({
        next: () => this.unread.set(0),
      });
    }
  }

  open(item: AppNotification): void {
    this.panelOpen.set(false);
    if (item.linkUrl) {
      this.router.navigateByUrl(this.authService.homeRoute() + item.linkUrl);
    }
  }

  logOut(): void {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }

  private loadNotifications(): void {
    this.api.notifications().subscribe({
      next: (result) => {
        this.unread.set(result.unread);
        this.notifications.set(result.items);
      },
      error: () => {
        // The bell is optional; ignore failures so pages still load.
      },
    });
  }
}
