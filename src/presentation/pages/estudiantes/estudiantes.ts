import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { useEstudiante } from '../../hooks/use-estudiante.hook';
import { Estudiante } from '../../../domain/entities/estudiante.entity';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-estudiantes',
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    TooltipModule,
    RouterLink,
  ],
  templateUrl: './estudiantes.html',
  styleUrl: './estudiantes.css',
})
export class Estudiantes implements OnInit {
  estudianteService = inject(useEstudiante);

  constructor() {}

  ngOnInit() {
    this.estudianteService.loadEstudiantes();
  }

  get estudiantes() {
    return this.estudianteService.estudiantes();
  }

  get loading() {
    return this.estudianteService.loading();
  }

  get error() {
    return this.estudianteService.error();
  }



  onSearch(event: any) {
    const searchTerm = event.target.value;
    if (searchTerm.trim()) {
      this.estudianteService.searchEstudiantes(searchTerm);
    } else {
      this.estudianteService.loadEstudiantes();
    }
  }

}
