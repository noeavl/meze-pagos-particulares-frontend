import { Component, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { Select } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { useUser } from '../../hooks/use-user.hook';
import { useLogin } from '../../hooks/use-login.hook';
import { User } from '../../../domain/entities/user.entity';

@Component({
  selector: 'app-usuarios',
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    TableModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    TooltipModule,
    Select,
    DialogModule,
    ToastModule,
  ],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css',
  providers: [MessageService],
})
export class Usuarios implements OnInit {
  visible: boolean = false;
  selectedUsuario: User | null = null;
  userService = inject(useUser);
  loginService = inject(useLogin);
  messageService = inject(MessageService);

  // Filtros y búsqueda
  selectedStatus: string = '';
  searchTerm: string = '';

  statusOptions = [
    { label: 'Activo', value: 'active' },
    { label: 'Inactivo', value: 'inactive' },
  ];

  // Computed para obtener el usuario actual
  currentUser = computed(() => {
    return this.loginService.user();
  });

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
      const estado = this.selectedStatus === 'active';
      filtered = filtered.filter((usuario) => usuario.estado === estado);
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
    return this.filteredUsuarios.filter(user => user.estado).length;
  }

  get inactiveUsersCount() {
    return this.filteredUsuarios.filter(user => !user.estado).length;
  }

  onSearch(event: any) {
    this.searchTerm = event.target.value;
  }

  onStatusChange() {
    // El filtro se aplica automáticamente a través del getter filteredUsuarios
  }

  canDeactivateUser(usuario: User): boolean {
    const currentUser = this.currentUser();
    
    // Si no hay usuario actual, no permitir la operación
    if (!currentUser) return false;
    
    // Si el usuario es superadmin y está intentando desactivarse a sí mismo
    if (currentUser.role === 'superadmin' && 
        currentUser.email === usuario.email && 
        usuario.estado === true) {
      return false;
    }
    
    return true;
  }

  showDialog(usuario: User) {
    // Validar si se puede desactivar el usuario
    if (!this.canDeactivateUser(usuario)) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Acción no permitida',
        detail: 'Un superadmin no puede desactivarse a sí mismo',
        life: 3000
      });
      return;
    }

    this.selectedUsuario = usuario;
    this.visible = true;
  }

  async updateEstadoUsuario() {
    if (!this.selectedUsuario) return;

    const newEstado = !this.selectedUsuario.estado;
    
    try {
      await this.userService.updateUserEstado(
        this.selectedUsuario.id, 
        newEstado
      ).toPromise();

      // Actualizar el usuario en la lista local
      const usuarios = this.userService.usuarios();
      const updatedUsuarios = usuarios.map(user => 
        user.id === this.selectedUsuario!.id 
          ? { ...user, estado: newEstado }
          : user
      );
      this.userService.usuarios.set(updatedUsuarios);

      this.messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: `Usuario ${newEstado ? 'activado' : 'desactivado'} correctamente`,
        life: 1500
      });

      this.visible = false;
      this.selectedUsuario = null;
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo actualizar el estado del usuario',
        life: 1500
      });
    }
  }

  cancelDialog() {
    this.visible = false;
    this.selectedUsuario = null;
  }
}
