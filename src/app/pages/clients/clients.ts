import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ClientsService, Client } from '../../core/clients';

@Component({
  selector: 'app-clients',
  templateUrl: './clients.html',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule
  ]
})
export class ClientsComponent {
  clients: Client[] | undefined;
  private clientsService = inject(ClientsService);
  private router = inject(Router);

  ngOnInit() {
    this.clientsService.get_clients().subscribe({
      next: (data) => this.clients = data,
      error: (err: any) => console.error('Error fetching clients', err)
    });
  }

  logout() {
    localStorage.removeItem('access_token');
    this.router.navigate(['/login']);
  }
}
