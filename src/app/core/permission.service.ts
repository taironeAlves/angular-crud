import { Injectable, inject } from '@angular/core';
import { AuthService } from './auth';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  private authService = inject(AuthService);

  canViewAllClients(): boolean {
    return this.authService.is_admin();
  }

  canCreateClient(): boolean {
    return this.authService.is_admin();
  }

  canEditClient(clientId: number): boolean {
    if (this.authService.is_admin()) {
      return true;
    }
    const currentUserId = this.authService.get_current_user_id();
    return currentUserId === clientId;
  }

  canDeleteClient(): boolean {
    return this.authService.is_admin();
  }

  canViewProducts(): boolean {
    return true; // Todos podem visualizar
  }

  canCreateOrder(): boolean {
    return true; // Todos podem criar pedidos
  }

  canDeleteProduct(): boolean {
    return this.authService.is_admin();
  }

  canDeleteOrder(): boolean {
    return this.authService.is_admin();
  }
}
