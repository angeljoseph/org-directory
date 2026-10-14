import { KNOWN_STATUSES, KnownStatus, OrgStatus, Organisation } from './org.model';

type UnknownRecord = Record<string, unknown>;

const isRecord = (v: unknown): v is UnknownRecord =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}/;
const DIGITS_RE = /^\d+$/;

export function parseName(v: unknown): string | null {
  if (typeof v !== 'string') return null;
  const trimmed = v.trim();
  return trimmed === '' ? null : trimmed;
}

export function parseStatus(v: unknown): OrgStatus {
  if (typeof v !== 'string') return 'unknown';
  const normalised = v.trim().toLowerCase();
  return (KNOWN_STATUSES as readonly string[]).includes(normalised)
    ? (normalised as KnownStatus)
    : 'unknown';
}

export function parseMemberCount(v: unknown): number | null {
  if (typeof v === 'number') return Number.isInteger(v) && v >= 0 ? v : null;
  if (typeof v === 'string' && DIGITS_RE.test(v.trim())) return Number(v.trim());
  return null;
}

export function parseEmail(v: unknown): string | null {
  if (!isRecord(v)) return null;
  const email = v['email'];
  if (typeof email !== 'string') return null;
  const trimmed = email.trim();
  return EMAIL_RE.test(trimmed) ? trimmed : null;
}

export function parseCreatedAt(v: unknown): Date | null {
  let date: Date;
  if (typeof v === 'number') {
    date = new Date(v);
  } else if (typeof v === 'string') {
    const s = v.trim();
    if (DIGITS_RE.test(s)) date = new Date(Number(s));
    else if (ISO_DATE_RE.test(s)) date = new Date(s);
    else return null;
  } else {
    return null;
  }
  return Number.isNaN(date.getTime()) ? null : date;
}

export function mapOrganisation(raw: unknown, key: string): Organisation {
  const r: UnknownRecord = isRecord(raw) ? raw : {};
  return {
    key,
    id: typeof r['id'] === 'number' ? r['id'] : null,
    name: parseName(r['name']),
    status: parseStatus(r['status']),
    memberCount: parseMemberCount(r['memberCount']),
    ownerEmail: parseEmail(r['owner']),
    createdAt: parseCreatedAt(r['createdAt']),
  };
}

export function mapPage(items: readonly unknown[], page: number): Organisation[] {
  return items.map((raw, i) => mapOrganisation(raw, `${page}:${i}`));
}