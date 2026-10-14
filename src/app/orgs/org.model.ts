export const KNOWN_STATUSES = ['active', 'inactive', 'suspended', 'pending'] as const;
export type KnownStatus = (typeof KNOWN_STATUSES)[number];
export type OrgStatus = KnownStatus | 'unknown';

export interface Organisation {
  readonly key: string;              // unique per row (API ids repeat)
  readonly id: number | null;
  readonly name: string | null;      // null = blank, UI shows a placeholder
  readonly status: OrgStatus;
  readonly memberCount: number | null;
  readonly ownerEmail: string | null; // null = missing or invalid
  readonly createdAt: Date | null;    // null = missing or unparseable
}