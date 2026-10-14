import { Component, ElementRef, inject, input, output, signal } from '@angular/core';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { TranslationKey } from '../../core/i18n.service';
import { TranslatePipe } from '../../core/translate.pipe';
import { EMAIL_PATTERN, OrgStatus } from '../org.mapper';

export type CreatableStatus = Exclude<OrgStatus, 'unknown'>;

export interface NewOrganisation {
  name: string;
  status: CreatableStatus;
  ownerEmail: string;
  memberCount: number | null;
}

type FieldName = 'name' | 'status' | 'ownerEmail' | 'memberCount';

// "field.errorCode" -> translation key
const ERROR_KEYS: Record<string, TranslationKey> = {
  'name.required': 'error.name.required',
  'name.tooShort': 'error.name.tooShort',
  'name.tooLong': 'error.name.tooLong',
  'name.duplicate': 'error.name.duplicate',
  'status.required': 'error.status.required',
  'ownerEmail.required': 'error.ownerEmail.required',
  'ownerEmail.pattern': 'error.ownerEmail.pattern',
  'memberCount.min': 'error.memberCount.min',
  'memberCount.integer': 'error.memberCount.integer',
};

// 3 to 80 characters, ignoring spaces at the start and end.
const nameLength: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const length = String(control.value).trim().length;
  if (length === 0) return { required: true };
  if (length < 3) return { tooShort: true };
  if (length > 80) return { tooLong: true };
  return null;
};

const wholeNumber: ValidatorFn = (control: AbstractControl): ValidationErrors | null =>
  control.value === null || Number.isInteger(control.value) ? null : { integer: true };

@Component({
  selector: 'app-org-create-form',
  imports: [ReactiveFormsModule, TranslatePipe],
  templateUrl: './org-create-form.component.html',
  styleUrl: './org-create-form.component.css',
})
export class OrgCreateFormComponent {
  /** Names that already exist; the parent passes them in. */
  readonly existingNames = input<string[]>([]);
  readonly created = output<NewOrganisation>();
  readonly cancelled = output<void>();

  private readonly fb = inject(NonNullableFormBuilder);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly statuses: CreatableStatus[] = ['active', 'inactive', 'suspended', 'pending'];
  readonly showSummary = signal(false);

  readonly form = this.fb.group({
    name: ['', [nameLength, this.uniqueName()]],
    status: ['' as '' | CreatableStatus, Validators.required],
    ownerEmail: ['', [Validators.required, Validators.pattern(EMAIL_PATTERN)]],
    memberCount: this.fb.control<number | null>(null, [Validators.min(0), wholeNumber]),
  });

  // Case-insensitive check against the names the list knows about.
  private uniqueName(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = String(control.value).trim().toLowerCase();
      if (!value) return null;
      const taken = this.existingNames().some((n) => n.trim().toLowerCase() === value);
      return taken ? { duplicate: true } : null;
    };
  }

  // An error shows only after the user has left the field (or pressed Create).
  errorFor(field: FieldName): TranslationKey | null {
    const control = this.form.controls[field];
    if (!control.touched || !control.errors) return null;
    const code = Object.keys(control.errors)[0];
    return ERROR_KEYS[`${field}.${code}`] ?? null;
  }

  submit(): void {
    // More pages may have loaded since the user typed the name.
    this.form.controls.name.updateValueAndValidity();

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.showSummary.set(true);
      this.host.nativeElement.querySelector<HTMLElement>('.ng-invalid[id]')?.focus();
      return;
    }

    const value = this.form.getRawValue();
    this.created.emit({
      name: value.name.trim(),
      status: value.status as CreatableStatus,
      ownerEmail: value.ownerEmail.trim(),
      memberCount: value.memberCount,
    });
  }

  statusLabel(status: CreatableStatus): TranslationKey {
    return `status.${status}`;
  }
}