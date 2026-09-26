import { Component, inject } from '@angular/core';
import { DashboardComponent } from './components/dashboard/dashboard';
import { LoginComponent } from './components/login/login';
import { AuthService } from './services/auth';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [DashboardComponent, LoginComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class AppComponent {
  authService = inject(AuthService);
  protected readonly location = location;
}
