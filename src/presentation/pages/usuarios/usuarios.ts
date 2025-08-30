import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { Select } from 'primeng/select';
import { useUser } from '../../hooks/use-user.hook';

@Component({
  selector: 'app-usuarios',
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    TooltipModule,
    Select,
  ],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css',
})
export class Usuarios implements OnInit {
  userService = inject(useUser);

  // Filtros y búsqueda
  selectedStatus: string = '';
  searchTerm: string = '';

  statusOptions = [
    { label: 'Activo', value: 'active' },
    { label: 'Inactivo', value: 'inactive' },
  ];

  constructor() {}

  ngOnInit() {
    this.userService.loadUsers();
  }

  usuarios = this.userService.usuarios;
  loading = this.userService.loading;
  error = this.userService.error;

  get filteredUsuarios() {
    let filtered = this.usuarios();

    // Filtrar por estado si está seleccionado
    if (this.selectedStatus) {
      const isActive = this.selectedStatus === 'active';
      filtered = filtered.filter((usuario) => usuario.isActive === isActive);
    }

    // Filtrar por término de búsqueda
    if (this.searchTerm.trim()) {
      filtered = filtered.filter(
        (usuario) =>
          usuario.name
            .toLowerCase()
            .includes(this.searchTerm.toLowerCase()) ||
          usuario.email
            .toLowerCase()
            .includes(this.searchTerm.toLowerCase())
      );
    }

    return filtered;
  }

  get activeUsersCount() {
    return this.filteredUsuarios.filter(user => user.isActive).length;
  }

  get inactiveUsersCount() {
    return this.filteredUsuarios.filter(user => !user.isActive).length;
  }

  onSearch(event: any) {
    this.searchTerm = event.target.value;
  }

  onStatusChange() {
    // El filtro se aplica automáticamente a través del getter filteredUsuarios
  }
}
