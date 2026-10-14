import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TranslationKey } from '../../../core/i18n.service';
import { TranslatePipe } from '../../../core/translate.pipe';
import { OrgStatus, Organisation, mapOrganisation } from '../../org.mapper';

import { firstValueFrom } from 'rxjs';
import { ApiError, OrgApiService, PAGE_SIZE, RawPage } from '../../../core/org-api.service';
const RATE_LIMIT_WAIT_MS = 5000;
const MAX_FAILURES_PER_PAGE = 3;
const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

@Component({
  selector: 'app-org-list',
  imports: [DatePipe, TranslatePipe],
  templateUrl: './org-list.component.html',
  styleUrl: './org-list.component.css',
})
export class OrgListComponent implements OnInit {
  private readonly api = inject(OrgApiService);

  readonly orgs = signal<Organisation[]>([]);
  readonly total = signal(0);
  readonly loading = signal(true);
  readonly error = signal(false);
  readonly rateLimited = signal(false);

  private nextPage = 1;
  private lastPage = 1; // updated after page 1 tells us the total

  ngOnInit(): void {
    this.loadAll();
  }

  async loadAll(): Promise<void> {
    this.loading.set(true);
    this.error.set(false);

    try {
      while (this.nextPage <= this.lastPage) {
        const page = await this.fetchPage(this.nextPage);
        const mapped = page.items.map((raw, i) => mapOrganisation(raw, `${page.page}:${i}`));
        this.orgs.update((list) => [...list, ...mapped]);
        this.total.set(page.total);
        this.lastPage = Math.ceil(page.total / PAGE_SIZE);
        this.nextPage++;
      }
    } catch {
      this.error.set(true);
    } finally {
      this.loading.set(false);
      this.rateLimited.set(false);
    }
  }

  private async fetchPage(page: number): Promise<RawPage> {
    let failures = 0;
    while (true) {
      try {
        const result = await firstValueFrom(this.api.getPage(page));
        this.rateLimited.set(false);
        return result;
      } catch (e) {
        if (e instanceof ApiError && e.kind === 'rate-limit') {
          this.rateLimited.set(true);
          await sleep(RATE_LIMIT_WAIT_MS);
        } else {
          failures++;
          if (failures >= MAX_FAILURES_PER_PAGE) throw e;
        }
      }
    }
  }

  statusLabel(status: OrgStatus): TranslationKey {
    return `status.${status}`;
  }
}