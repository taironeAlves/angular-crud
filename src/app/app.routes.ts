import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login';
import { ClientsComponent } from './pages/clients/clients';
import { ProductsComponent } from './pages/products/products';
import { OrdersComponent } from './pages/orders/orders';
import { authGuard } from './core/auth-guard';
import { adminGuard } from './core/admin-guard';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'clients',
    component: ClientsComponent,
    canActivate: [authGuard, adminGuard]
  },
  {
    path: 'products',
    component: ProductsComponent,
    canActivate: [authGuard]
  },
  {
    path: 'orders',
    component: OrdersComponent,
    canActivate: [authGuard]
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];
