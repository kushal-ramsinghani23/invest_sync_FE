import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CompanyService, Company, Stats } from '../../services/company';
import { SocketService } from '../../services/socket';

interface Toast {
  id: number;
  message: string;
}

interface ActivityEntry {
  id: number;
  action: string;
  company_name: string;
  details: string;
  created_at: string;
}

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
  stats = signal<Stats | null>(null);
  connected = signal(false);
  toasts = signal<Toast[]>([]);
  activity = signal<ActivityEntry[]>([]);
  private toastId = 0;

  newCompany = signal({ name: '', sector: '', stage: 'In Review', metric_value: 0 });

  editingId = signal<number | null>(null);
  editForm = signal({ name: '', sector: '', stage: '', metric_value: 0 });

  // filters + pagination
  searchTerm = signal('');
  stageFilter = signal('');
  currentPage = signal(1);
  totalPages = signal(1);
  pageSize = 5;

  private subs: Subscription[] = [];

  ngOnInit(): void {
    this.loadCompanies();
    this.loadStats();
    this.loadActivity();

    this.subs.push(
      this.socketService.onConnectionChange().subscribe((status) => this.connected.set(status)),
    );

    this.subs.push(
      this.socketService.onCompanyCreated().subscribe((company) => {
        this.loadCompanies();
        this.loadStats();
        this.addToast(`New company added: ${company.name}`);
      }),
    );

    this.subs.push(
      this.socketService.onCompanyUpdated().subscribe((updated) => {
        this.loadCompanies();
        this.loadStats();
        this.addToast(`${updated.name} updated`);
      }),
    );

    this.subs.push(
      this.socketService.onCompanyDeleted().subscribe((deleted) => {
        this.loadCompanies();
        this.loadStats();
        this.addToast(`${deleted.name} removed`);
      }),
    );

    this.subs.push(
      this.socketService.onActivityLogged().subscribe((entry) => {
        this.activity.update((current) => [entry, ...current].slice(0, 20));
      }),
    );
  }

  loadCompanies(): void {
    this.companyService
      .getCompanies({
        search: this.searchTerm(),
        stage: this.stageFilter(),
        page: this.currentPage(),
        limit: this.pageSize,
      })
      .subscribe({
        next: (res) => {
          this.companies.set(res.data);
          this.totalPages.set(res.totalPages);
        },
        error: (err) => console.error('Failed to load companies', err),
      });
  }

  loadStats(): void {
    this.companyService.getStats().subscribe({
      next: (data) => this.stats.set(data),
      error: (err) => console.error('Failed to load stats', err),
    });
  }

  loadActivity(): void {
    fetch('http://localhost:3000/companies/activity')
      .then((res) => res.json())
      .then((data) => this.activity.set(data))
      .catch((err) => console.error('Failed to load activity', err));
  }

  onSearchChange(value: string): void {
    this.searchTerm.set(value);
    this.currentPage.set(1);
    this.loadCompanies();
  }

  onStageFilterChange(value: string): void {
    this.stageFilter.set(value);
    this.currentPage.set(1);
    this.loadCompanies();
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update((p) => p + 1);
      this.loadCompanies();
    }
  }

  prevPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update((p) => p - 1);
      this.loadCompanies();
    }
  }

  updateNewCompany(field: string, value: string | number): void {
    this.newCompany.update((current) => ({ ...current, [field]: value }));
  }

  onSubmit(): void {
    this.companyService.createCompany(this.newCompany()).subscribe({
      next: () =>
        this.newCompany.set({ name: '', sector: '', stage: 'In Review', metric_value: 0 }),
      error: (err) => console.error('Failed to create company', err),
    });
  }

  startEdit(company: Company): void {
    this.editingId.set(company.id);
    this.editForm.set({
      name: company.name,
      sector: company.sector,
      stage: company.stage,
      metric_value: company.metric_value,
    });
  }

  updateEditForm(field: string, value: string | number): void {
    this.editForm.update((current) => ({ ...current, [field]: value }));
  }

  saveEdit(id: number): void {
    this.companyService.updateCompany(id, this.editForm()).subscribe({
      next: () => this.editingId.set(null),
      error: (err) => console.error('Failed to update company', err),
    });
  }

  cancelEdit(): void {
    this.editingId.set(null);
  }

  removeCompany(id: number, name: string): void {
    if (!confirm(`Delete ${name}?`)) return;
    this.companyService.deleteCompany(id).subscribe({
      error: (err) => console.error('Failed to delete company', err),
    });
  }

  addToast(message: string): void {
    const id = ++this.toastId;
    this.toasts.update((t) => [...t, { id, message }]);
    setTimeout(() => {
      this.toasts.update((t) => t.filter((toast) => toast.id !== id));
    }, 3000);
  }

  stageColor(stage: string): string {
    switch (stage) {
      case 'In Review':
        return 'bg-amber-100 text-amber-800';
      case 'Due Diligence':
        return 'bg-blue-100 text-blue-800';
      case 'Invested':
        return 'bg-green-100 text-green-800';
      case 'Passed':
        return 'bg-gray-200 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  ngOnDestroy(): void {
    this.subs.forEach((sub) => sub.unsubscribe());
  }
}
