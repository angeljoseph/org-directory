import { Component, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterOutlet } from '@angular/router';
import { I18nService } from './core/i18n.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `<main><router-outlet /></main>`,
})
export class AppComponent {
  private readonly title = inject(Title);
  private readonly i18n = inject(I18nService);

  constructor() {
    // The tab title comes from en.json too (FR5).
    this.title.setTitle(this.i18n.t('app.title'));
  }
}