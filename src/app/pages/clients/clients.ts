import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ClientsService, Client } from '../../core/clients';
import { ClientFormComponent } from './client-form/client-form';
import { AuthService } from '../../core/auth';
import { PermissionService } from '../../core/permission.service';

@Component({
  selector: 'app-clients',
  templateUrl: './clients.html',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatTableModule,
    MatDialogModule,
    MatSnackBarModule
  ]
})
export class ClientsComponent implements OnInit {
  clients: Client[] = [];
  dataSource = new MatTableDataSource<Client>();
  displayedColumns = ['id_client', 'razao_social', 'cnpj', 'email', 'address', 'actions'];
  isAdmin = false;

  private clientsService = inject(ClientsService);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private cdr = inject(ChangeDetectorRef);
  private snackBar = inject(MatSnackBar);
  private authService = inject(AuthService);
  private permissionService = inject(PermissionService);

  ngOnInit() {
    this.isAdmin = this.permissionService.canViewAllClients();
    this.loadClients();
  }

  loadClients() {
    this.clientsService.get_clients().subscribe({
      next: (data) => {
        const clientsArray = Array.isArray(data) ? data : (data as any)?.data || [];

        if (!this.permissionService.canViewAllClients()) {
          const currentUserId = this.authService.get_current_user_id();
          this.clients = clientsArray.filter((c: Client) => c.id_client === currentUserId);
        } else {
          this.clients = clientsArray;
        }

        this.dataSource.data = this.clients;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error fetching clients', err)
    });
  }

  logout() {
    localStorage.removeItem('access_token');
    this.router.navigate(['/login']);
  }

  goToProducts() {
    this.router.navigate(['/products']);
  }

  goToOrders() {
    this.router.navigate(['/orders']);
  }

  openClientForm(client?: Client) {
    if (client && !this.permissionService.canEditClient(client.id_client)) {
      this.snackBar.open('Você não tem permiss\u00e3o para editar este cliente', 'Fechar', { duration: 3000 });
      return;
    }

    if (!client && !this.permissionService.canCreateClient()) {
      this.snackBar.open('Você não tem permiss\u00e3o para criar clientes', 'Fechar', { duration: 3000 });
      return;
    }

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

  deleteClient(client: Client) {
    if (!this.permissionService.canDeleteClient()) {
      this.snackBar.open('Você não tem permiss\u00e3o para deletar clientes', 'Fechar', { duration: 3000 });
      return;
    }

    if (confirm(`Tem certeza que deseja deletar o cliente "${client.razao_social || client.email}"?`)) {
      this.clientsService.delete_client(client.id_client).subscribe({
        next: () => {
          this.snackBar.open('Cliente deletado com sucesso!', 'Fechar', { duration: 3000 });
          this.loadClients();
        },
        error: (err) => {
          console.error('Erro ao deletar cliente', err);
          this.snackBar.open('Erro ao deletar cliente. Tente novamente.', 'Fechar', { duration: 3000 });
        }
      });
    }
  }
}
