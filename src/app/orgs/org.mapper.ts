export type OrgStatus = 'active' | 'inactive' | 'suspended' | 'pending' | 'unknown';

export interface Organisation {
  key: string;
  name: string | null;
  status: OrgStatus;
  memberCount: number | null;
  ownerEmail: string | null;
  createdAt: Date | null;
}
export const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

const STATUSES: OrgStatus[] = ['active', 'inactive', 'suspended', 'pending'];

export function mapOrganisation(raw: any, key: string): Organisation {
  // name: empty or missing becomes null
  const name = typeof raw.name === 'string' && raw.name.trim() ? raw.name.trim() : null;

  // status: "ACTIVE" becomes "active"; unrecognised ("actve", null) becomes "unknown"
  const s = String(raw.status ?? '').trim().toLowerCase();
  const status: OrgStatus = STATUSES.includes(s as OrgStatus) ? (s as OrgStatus) : 'unknown';

  // member count: "12" becomes 12; -1, null, text become null
  const n = Number(raw.memberCount);
  const hasCount = raw.memberCount !== null && raw.memberCount !== '' && raw.memberCount !== undefined;
  const memberCount = hasCount && Number.isInteger(n) && n >= 0 ? n : null;

  // owner email: missing or invalid becomes null
  const email = raw.owner?.email;
  const ownerEmail = typeof email === 'string' && EMAIL_PATTERN.test(email.trim()) ? email.trim() : null;
//   const ownerEmail = typeof email === 'string' && /^\S+@\S+\.\S+$/.test(email.trim()) ? email.trim() : null;

  // date: number, numeric string or ISO string; anything unreadable becomes null
  let createdAt: Date | null = null;
  if (raw.createdAt !== null && raw.createdAt !== undefined && raw.createdAt !== '') {
    const value = /^\d+$/.test(String(raw.createdAt)) ? Number(raw.createdAt) : raw.createdAt;
    const d = new Date(value);
    createdAt = isNaN(d.getTime()) ? null : d;
  }

  return { key, name, status, memberCount, ownerEmail, createdAt };
}