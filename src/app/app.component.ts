import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslatePipe } from './core/translate.pipe';
import { OrgApiService } from './core/org-api.service';

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
  }
}
