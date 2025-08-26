import { Component, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { useLogin } from '../../hooks/use-login.hook';
import { Route, Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [NgClass, RouterLink],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  private loginService = inject(useLogin);

  isSideBarCollapse = false;
  isPagosMenuOpen = false;

  private router = inject(Router);

  sideBarCollapse() {
    this.isSideBarCollapse = !this.isSideBarCollapse;
  }

  togglePagosMenu() {
    this.isPagosMenuOpen = !this.isPagosMenuOpen;
  }

  async logout() {
    await this.loginService.logout();
    this.router.navigate(['/login']);
  }
}
