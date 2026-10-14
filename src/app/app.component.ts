import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslatePipe } from './core/translate.pipe';
import { OrgApiService } from './core/org-api.service';
import { mapPage } from './orgs/org.mapper';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,TranslatePipe],
  template: `<h1>{{ 'app.title' | t }}</h1><router-outlet />`,
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'org-directory';
  constructor() {
    const api = inject(OrgApiService);

    for (let p = 1; p <= 7; p++) {
      api.getPage(p).subscribe({
        next: (r) => console.log('page', p, r.items.length, 'of', r.total),
        error: (e) => console.log('page', p, 'failed:', e.kind),
      });
    }
    api.getPage(1).subscribe((r) => console.table(mapPage(r.items, 1)));
    
  }
}
