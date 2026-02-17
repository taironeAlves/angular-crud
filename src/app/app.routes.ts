import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login';
import { ClientsComponent } from './pages/clients/clients';
import { authGuard } from './core/auth-guard';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'clients',
    component: ClientsComponent,
    canActivate: [authGuard]
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];
