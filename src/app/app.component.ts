import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslatePipe } from './core/translate.pipe';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,TranslatePipe],
  template: `<h1>{{ 'app.title' | t }}</h1><router-outlet />`,
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'org-directory';
}
