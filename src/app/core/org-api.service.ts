import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, defer, map, switchMap, throwError, timer } from 'rxjs';

export const PAGE_SIZE = 25;
const MAX_REQUESTS_PER_MINUTE = 5;
const FAILURE_RATE = 0.15;

export interface RawPage {
  items: unknown[];
  total: number;
  page: number;
}

export class ApiError extends Error {
  constructor(public readonly kind: 'server' | 'rate-limit', message: string) {
    super(message);
  }
}

@Injectable({ providedIn: 'root' })
export class OrgApiService {
  private readonly http = inject(HttpClient);
  private readonly requestTimes: number[] = [];

  getPage(page: number): Observable<RawPage> {
    return defer(() => {
      const now = Date.now();
      while (this.requestTimes.length && now - this.requestTimes[0] > 60_000) {
        this.requestTimes.shift();
      }
      if (this.requestTimes.length >= MAX_REQUESTS_PER_MINUTE) {
        return throwError(() => new ApiError('rate-limit', '429'));
      }
      this.requestTimes.push(now);

      const latency = 400 + Math.random() * 500;
      return timer(latency).pipe(
        switchMap(() =>
          Math.random() < FAILURE_RATE
            ? throwError(() => new ApiError('server', '500'))
            : this.http.get<unknown[]>('organisations.json'),
        ),
        map((all) => ({
          items: all.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
          total: all.length,
          page,
        })),
      );
    });
  }
}