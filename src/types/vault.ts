export type VaultCategory = 'all' | 'login' | 'note' | 'card' | 'api' | 'totp';

export type SecuritySeverity = 'critical' | 'high' | 'medium' | 'low' | 'secure';

export interface CardDetails {
  cardNumber: string;
  cardHolder: string;
  expiry: string;
  cvv: string;
  brand: string;
}

export interface CredentialItem {
  id: string;
  title: string;
  category: 'login' | 'note' | 'card' | 'api' | 'totp';
  username?: string;
  password?: string;
  url?: string;
  notes?: string;
  totpSecret?: string;
  favorite: boolean;
  entropyScore: number; // 0 to 128 bits
  isBreached?: boolean;
  isReused?: boolean;
  created: string;
  lastModified: string;
  cardDetails?: CardDetails;
}

export interface VaultMetrics {
  healthScore: number;
  totalCredentials: number;
  weakCount: number;
  reusedCount: number;
  compromisedCount: number;
  totpSecuredCount: number;
}

export interface SecurityAuditResult {
  id: string;
  credentialId: string;
  title: string;
  issue: string;
  severity: SecuritySeverity;
  recommendation: string;
  entropyBits: number;
}

export interface EncryptedExportPackage {
  app: string;
  version: string;
  vaultId: string;
  algorithm: string;
  kdf: string;
  salt: string;
  iv: string;
  ciphertext: string;
  checksumSha256: string;
  exportedAt: string;
}
