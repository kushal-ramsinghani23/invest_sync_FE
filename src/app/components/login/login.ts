import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
})
export class LoginComponent {
  private authService = inject(AuthService);
  username = signal('');
  password = signal('');
  error = signal('');

  onSubmit(): void {
    this.authService.login(this.username(), this.password()).subscribe({
      next: () => window.location.reload(),
      error: () => this.error.set('Invalid username or password'),
    });
  }
}
