import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { ApiError, OrgApiService, PAGE_SIZE, RawPage } from '../../../core/org-api.service';
import { TranslationKey } from '../../../core/i18n.service';
import { TranslatePipe } from '../../../core/translate.pipe';
import { OrgStatus, Organisation, mapOrganisation } from '../../org.mapper';

type SortKey = 'name' | 'createdAt';
type SortDir = 'asc' | 'desc';

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

  readonly sortKey = signal<SortKey | null>(null);
  readonly sortDir = signal<SortDir>('asc');

  readonly sortedOrgs = computed(() => {
    const key = this.sortKey();
    const list = this.orgs();
    if (!key) return list;

    const factor = this.sortDir() === 'asc' ? 1 : -1;
    return [...list].sort((a, b) =>
      key === 'name' ? this.byName(a, b, factor) : this.byDate(a, b, factor),
    );
  });

    

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

   sortBy(key: SortKey): void {
    if (this.sortKey() === key) {
      this.sortDir.update((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortKey.set(key);
      this.sortDir.set('asc');
    }
  }

  sortArrow(key: SortKey): TranslationKey {
    if (this.sortKey() !== key) return 'sort.none';
    return this.sortDir() === 'asc' ? 'sort.asc' : 'sort.desc';
  }

  ariaSort(key: SortKey): 'ascending' | 'descending' | 'none' {
    if (this.sortKey() !== key) return 'none';
    return this.sortDir() === 'asc' ? 'ascending' : 'descending';
  }

  private byName(a: Organisation, b: Organisation, factor: number): number {
    if (a.name === null || b.name === null) return this.nullsLast(a.name, b.name);
    return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }) * factor;
  }

  private byDate(a: Organisation, b: Organisation, factor: number): number {
    if (a.createdAt === null || b.createdAt === null) return this.nullsLast(a.createdAt, b.createdAt);
    return (a.createdAt.getTime() - b.createdAt.getTime()) * factor;
  }

  // Missing values go to the bottom in both directions.
  private nullsLast(x: unknown, y: unknown): number {
    if (x === null && y === null) return 0;
    return x === null ? 1 : -1;
  }

  statusLabel(status: OrgStatus): TranslationKey {
    return `status.${status}`;
  }
}