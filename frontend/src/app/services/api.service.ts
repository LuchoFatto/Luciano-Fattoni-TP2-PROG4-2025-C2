import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_BASE = 'http://localhost:3000';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private http = inject(HttpClient);

  get<T>(url: string): Observable<T> {
    return this.http.get<T>(API_BASE + url);
  }

  post<T>(url: string, body: any): Observable<T> {
    return this.http.post<T>(API_BASE + url, body);
  }

  put<T>(url: string, body: any): Observable<T> {
    return this.http.put<T>(API_BASE + url, body);
  }

  patch<T>(url: string, body: any): Observable<T> {
    return this.http.patch<T>(API_BASE + url, body);
  }

  delete<T>(url: string): Observable<T> {
    return this.http.delete<T>(API_BASE + url);
  }
}
