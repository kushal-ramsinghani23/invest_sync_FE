import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Company {
  id: number;
  name: string;
  sector: string;
  stage: string;
  metric_value: number;
  updated_at: string;
}

export interface Stats {
  totalCompanies: number;
  totalValue: number;
  byStage: { stage: string; count: number }[];
}

export interface PaginatedCompanies {
  data: Company[];
  total: number;
  page: number;
  totalPages: number;
}

export interface CompanyFilters {
  search?: string;
  sector?: string;
  stage?: string;
  page?: number;
  limit?: number;
}

@Injectable({ providedIn: 'root' })
export class CompanyService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:3000/companies';

  getCompanies(filters: CompanyFilters = {}): Observable<PaginatedCompanies> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params = params.set(key, value.toString());
      }
    });
    return this.http.get<PaginatedCompanies>(this.baseUrl, { params });
  }

  createCompany(company: Partial<Company>): Observable<Company> {
    return this.http.post<Company>(this.baseUrl, company);
  }

  updateCompany(id: number, company: Partial<Company>): Observable<Company> {
    return this.http.put<Company>(`${this.baseUrl}/${id}`, company);
  }

  deleteCompany(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  getStats(): Observable<Stats> {
    return this.http.get<Stats>(`${this.baseUrl}/stats`);
  }
}
