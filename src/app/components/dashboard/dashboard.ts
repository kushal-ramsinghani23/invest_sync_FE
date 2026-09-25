import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CompanyService, Company } from '../../services/company';
import { SocketService } from '../../services/socket';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardComponent implements OnInit, OnDestroy {
  private companyService = inject(CompanyService);
  private socketService = inject(SocketService);

  companies = signal<Company[]>([]);
  newCompany = signal({
    name: '',
    sector: '',
    stage: 'In Review',
    metric_value: 0,
  });

  private subs: Subscription[] = [];

  ngOnInit(): void {
    this.loadCompanies();

    this.subs.push(
      this.socketService.onCompanyCreated().subscribe((company) => {
        this.companies.update((current) => [company, ...current]);
      }),
    );

    this.subs.push(
      this.socketService.onCompanyUpdated().subscribe((updated) => {
        this.companies.update((current) => current.map((c) => (c.id === updated.id ? updated : c)));
      }),
    );

    this.subs.push(
      this.socketService.onCompanyDeleted().subscribe((deleted) => {
        this.companies.update((current) => current.filter((c) => c.id !== deleted.id));
      }),
    );
  }

  loadCompanies(): void {
    this.companyService.getCompanies().subscribe({
      next: (data) => this.companies.set(data),
      error: (err) => console.error('Failed to load companies', err),
    });
  }

  updateNewCompany(field: string, value: string | number): void {
    this.newCompany.update((current) => ({ ...current, [field]: value }));
  }

  onSubmit(): void {
    this.companyService.createCompany(this.newCompany()).subscribe({
      next: () => {
        this.newCompany.set({ name: '', sector: '', stage: 'In Review', metric_value: 0 });
      },
      error: (err) => console.error('Failed to create company', err),
    });
  }

  ngOnDestroy(): void {
    this.subs.forEach((sub) => sub.unsubscribe());
  }
}
