import { Injectable } from '@angular/core';
import en from '../i18n/en.json';

export type TranslationKey = keyof typeof en;
export type TranslationParams = Record<string, string | number>;

@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly messages: Record<TranslationKey, string> = en;

  t(key: TranslationKey, params?: TranslationParams): string {
    const template = this.messages[key];
    if (!params) return template;
    return template.replace(/\{(\w+)\}/g, (_, name: string) => String(params[name] ?? `{${name}}`));
  }
}