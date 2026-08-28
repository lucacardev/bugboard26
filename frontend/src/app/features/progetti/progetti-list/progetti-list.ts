import { Component, inject } from '@angular/core';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-progetti-list',
  imports: [],
  templateUrl: './progetti-list.html',
  styleUrl: './progetti-list.scss',
})
export class ProgettiList {
  auth = inject(AuthService);
}