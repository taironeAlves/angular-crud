import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth';


@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule
  ]
})
export class LoginComponent {

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private auth_service = inject(AuthService);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  on_submit() {
    if (this.form.invalid) return;

    this.auth_service.login(this.form.value as any).subscribe({
      next: (response) => {
        const token = response.access_token;

        this.auth_service.save_token(token);

        const isAdmin = this.auth_service.is_admin();

        if (isAdmin) {
          this.router.navigate(['/clients']);
        } else {
          this.router.navigate(['/products']);
        }
      },
      error: (err) => {
        console.error('Login error', err);
      }
    });
  }
}
