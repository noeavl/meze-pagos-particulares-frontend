import { Component, inject, computed, OnInit } from '@angular/core';
import { NgClass } from '@angular/common';
import { useLogin } from '../../hooks/use-login.hook';
import { Route, Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [NgClass, RouterLink],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar implements OnInit {
  private loginService = inject(useLogin);
  private router = inject(Router);

  isSideBarCollapse = false;
  isParticularOpen = false;

  // Computed para obtener el usuario actual
  currentUser = computed(() => {
    return this.loginService.user();
  });

  // Computed para verificar si el usuario es superadmin usando el hook de login
  isSuperAdmin = computed(() => {
    const currentUser = this.currentUser();
    return currentUser?.role === 'superadmin';
  });

  ngOnInit() {
    // Verificar el usuario actual al cargar el componente
    this.loginService.checkCurrentUser();
  }

  sideBarCollapse() {
    this.isSideBarCollapse = !this.isSideBarCollapse;
  }

  toggleParticular() {
    this.isParticularOpen = !this.isParticularOpen;
  }

  async logout() {
    await this.loginService.logout();
    this.router.navigate(['/login']);
  }
}
