import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ClientsService, Client } from '../../core/clients';
import { ClientFormComponent } from './client-form/client-form';

@Component({
  selector: 'app-clients',
  templateUrl: './clients.html',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatTableModule,
    MatDialogModule
  ]
})
export class ClientsComponent {
  clients: Client[] = [];
  dataSource = new MatTableDataSource<Client>();
  displayedColumns = ['id_client', 'razao_social', 'cnpj', 'email', 'address', 'actions'];

  private clientsService = inject(ClientsService);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  ngOnInit() {
    this.loadClients();
  }

  loadClients() {
    this.clientsService.get_clients().subscribe({
      next: (data) => {
        this.clients = data;
        this.dataSource.data = data;
      },
      error: (err) => console.error('Error fetching clients', err)
    });
  }

  logout() {
    localStorage.removeItem('access_token');
    this.router.navigate(['/login']);
  }

  trackById(index: number, client: Client) {
    return client.id_client;
  }

  openClientForm(client?: Client) {
    const dialogRef = this.dialog.open(ClientFormComponent, {
      width: '400px',
      data: client ? { client } : {}
    });

    dialogRef.afterClosed().subscribe((result: boolean | undefined) => {
      if (result) {
        this.loadClients(); 
      }
    });
  }
}
