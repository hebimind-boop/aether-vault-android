import { create } from 'zustand';
import { CredentialItem, VaultCategory, VaultMetrics, SecurityAuditResult } from '../types/vault';
import { CryptoService } from '../services/cryptoService';

const INITIAL_CREDENTIALS: CredentialItem[] = [
  {
    id: 'c1',
    title: 'AWS Production Cloud',
    category: 'login',
    username: 'secops-root@aether-infra.internal',
    password: 'vK9#mQ2$zL8!pW4^jX7*bC1@',
    url: 'https://signin.aws.amazon.com/console',
    notes: 'Primary production root account. Multi-region failover enabled.',
    totpSecret: 'JBSWY3DPEHPK3PXP',
    favorite: true,
    entropyScore: 118,
    isBreached: false,
    isReused: false,
    created: '2026-08-14T10:00:00Z',
    lastModified: '2026-10-01T15:20:00Z',
  },
  {
    id: 'c2',
    title: 'GitHub Enterprise Org',
    category: 'login',
    username: 'lead-devops@aether-systems',
    password: 'qZ8$bW2^vT6!xR4#nM1*pK9@',
    url: 'https://github.com/aether-systems',
    notes: 'Organization owner key. Hardware FIDO2 backup configured.',
    totpSecret: 'KRSXG5CTMVRXEZLU',
    favorite: true,
    entropyScore: 124,
    isBreached: false,
    isReused: false,
    created: '2026-08-20T12:00:00Z',
    lastModified: '2026-09-28T09:15:00Z',
  },
  {
    id: 'c3',
    title: 'OpenAI Swarm Cluster API',
    category: 'api',
    username: 'prod-cluster-agent-pool',
    password: 'sk-proj-4982af8190d7c481903ba84918e918c',
    url: 'https://api.openai.com/v1',
    notes: 'Token allowance: $25k/month. Egress restricted to iad-1 VPC.',
    favorite: false,
    entropyScore: 128,
    isBreached: false,
    isReused: false,
    created: '2026-09-01T11:00:00Z',
    lastModified: '2026-10-03T18:40:00Z',
  },
  {
    id: 'c4',
    title: 'Stripe Settlement Gateway',
    category: 'login',
    username: 'treasury@aethervault.io',
    password: 'hT4!yU8#vN2$eW6*qM9^zX1@',
    url: 'https://dashboard.stripe.com',
    notes: 'Automated settlement payouts. Daily reconciliation at 00:00 UTC.',
    totpSecret: 'MFRGGZDFMY2GCMZR',
    favorite: true,
    entropyScore: 112,
    isBreached: false,
    isReused: false,
    created: '2026-08-25T14:30:00Z',
    lastModified: '2026-10-02T16:00:00Z',
  },
  {
    id: 'c5',
    title: 'Legacy Staging Database',
    category: 'login',
    username: 'admin',
    password: 'Password2024!', // Flagged weak password for security audit
    url: 'https://staging-db.internal.net:5432',
    notes: 'Old PostgreSQL staging replica. Needs password rotation!',
    favorite: false,
    entropyScore: 44,
    isBreached: true,
    isReused: true,
    created: '2026-07-10T08:00:00Z',
    lastModified: '2026-07-10T08:00:00Z',
  },
  {
    id: 'c6',
    title: 'Internal Jenkins CI Node',
    category: 'login',
    username: 'builder',
    password: 'Password2024!', // Reused password for security audit
    url: 'https://ci.internal.aether.net',
    notes: 'Shares password with staging database. Vulnerability detected.',
    favorite: false,
    entropyScore: 44,
    isBreached: false,
    isReused: true,
    created: '2026-07-12T09:30:00Z',
    lastModified: '2026-07-12T09:30:00Z',
  },
  {
    id: 'c7',
    title: 'Corporate Treasury Card',
    category: 'card',
    username: 'Aether Technologies Inc',
    notes: 'Primary SaaS expenses card. Virtual card billing address in DE.',
    favorite: true,
    entropyScore: 96,
    created: '2026-08-01T12:00:00Z',
    lastModified: '2026-09-15T10:00:00Z',
    cardDetails: {
      cardNumber: '•••• •••• •••• 8829',
      cardHolder: 'AETHER CORP OPS',
      expiry: '09/29',
      cvv: '•••',
      brand: 'Visa Infinite',
    },
  },
  {
    id: 'c8',
    title: 'Cold Storage Safe Recovery',
    category: 'note',
    notes: 'Physical safe combination: 42-18-99. Secondary YubiKey stored in Zurich vault safety box #408.',
    favorite: false,
    entropyScore: 88,
    created: '2026-08-05T14:00:00Z',
    lastModified: '2026-08-05T14:00:00Z',
  },
];

interface VaultState {
  credentials: CredentialItem[];
  activeCategory: VaultCategory;
  searchQuery: string;
  isUnlocked: boolean;
  biometricActive: boolean;
  clipboardExpiry: number | null;

  // Actions
  setActiveCategory: (category: VaultCategory) => void;
  setSearchQuery: (query: string) => void;
  toggleFavorite: (id: string) => void;
  addCredential: (item: Omit<CredentialItem, 'id' | 'created' | 'lastModified' | 'entropyScore'>) => void;
  updateCredential: (id: string, updates: Partial<CredentialItem>) => void;
  deleteCredential: (id: string) => void;
  unlockVault: () => void;
  lockVault: () => void;
  triggerClipboardAutoClear: (seconds?: number) => void;
  getMetrics: () => VaultMetrics;
  getAuditResults: () => SecurityAuditResult[];
}

export const useVaultStore = create<VaultState>((set, get) => ({
  credentials: INITIAL_CREDENTIALS,
  activeCategory: 'all',
  searchQuery: '',
  isUnlocked: true,
  biometricActive: true,
  clipboardExpiry: null,

  setActiveCategory: (activeCategory) => set({ activeCategory }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),

  toggleFavorite: (id) =>
    set((state) => ({
      credentials: state.credentials.map((c) =>
        c.id === id ? { ...c, favorite: !c.favorite } : c
      ),
    })),

  addCredential: (item) => {
    const entropyScore = item.password
      ? CryptoService.calculateEntropy(item.password)
      : 80;

    const newItem: CredentialItem = {
      ...item,
      id: `c_${Date.now()}`,
      entropyScore,
      created: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    };

    set((state) => ({ credentials: [newItem, ...state.credentials] }));
  },

  updateCredential: (id, updates) => {
    set((state) => ({
      credentials: state.credentials.map((c) => {
        if (c.id !== id) return c;
        const newPassword = updates.password !== undefined ? updates.password : c.password;
        const entropyScore = newPassword ? CryptoService.calculateEntropy(newPassword) : c.entropyScore;
        return {
          ...c,
          ...updates,
          entropyScore,
          lastModified: new Date().toISOString(),
        };
      }),
    }));
  },

  deleteCredential: (id) =>
    set((state) => ({
      credentials: state.credentials.filter((c) => c.id !== id),
    })),

  unlockVault: () => set({ isUnlocked: true }),
  lockVault: () => set({ isUnlocked: false }),

  triggerClipboardAutoClear: (seconds = 30) => {
    const expiry = Date.now() + seconds * 1000;
    set({ clipboardExpiry: expiry });
  },

  getMetrics: (): VaultMetrics => {
    const { credentials } = get();
    const totalCredentials = credentials.length;
    let weakCount = 0;
    let reusedCount = 0;
    let compromisedCount = 0;
    let totpSecuredCount = 0;

    const passwordCounts: Record<string, number> = {};

    credentials.forEach((c) => {
      if (c.password) {
        if (c.entropyScore < 60) weakCount++;
        if (c.isBreached) compromisedCount++;
        passwordCounts[c.password] = (passwordCounts[c.password] || 0) + 1;
      }
      if (c.totpSecret) totpSecuredCount++;
    });

    Object.values(passwordCounts).forEach((count) => {
      if (count > 1) reusedCount += count;
    });

    // Compute health score out of 100
    let deductions = (weakCount * 12) + (reusedCount * 8) + (compromisedCount * 20);
    const healthScore = Math.max(15, Math.min(100, 100 - deductions));

    return {
      healthScore,
      totalCredentials,
      weakCount,
      reusedCount,
      compromisedCount,
      totpSecuredCount,
    };
  },

  getAuditResults: (): SecurityAuditResult[] => {
    const { credentials } = get();
    const results: SecurityAuditResult[] = [];

    // Check duplicates
    const passwordMap: Record<string, CredentialItem[]> = {};
    credentials.forEach((c) => {
      if (c.password) {
        passwordMap[c.password] = passwordMap[c.password] || [];
        passwordMap[c.password].push(c);
      }
    });

    // Check compromised
    credentials.forEach((c) => {
      if (c.isBreached) {
        results.push({
          id: `audit_breach_${c.id}`,
          credentialId: c.id,
          title: c.title,
          issue: 'Known Compromised Credential',
          severity: 'critical',
          recommendation: 'Password detected in global breach database. Rotate immediately.',
          entropyBits: c.entropyScore,
        });
      }

      if (c.password && c.entropyScore < 50) {
        results.push({
          id: `audit_weak_${c.id}`,
          credentialId: c.id,
          title: c.title,
          issue: `Low Entropy (${c.entropyScore} bits)`,
          severity: 'high',
          recommendation: 'Vulnerable to brute-force dictionaries. Increase length to 16+ chars.',
          entropyBits: c.entropyScore,
        });
      }

      if (passwordMap[c.password || ''] && passwordMap[c.password || ''].length > 1) {
        results.push({
          id: `audit_reuse_${c.id}`,
          credentialId: c.id,
          title: c.title,
          issue: `Reused across ${passwordMap[c.password || ''].length} services`,
          severity: 'medium',
          recommendation: 'Credential reuse creates cascading vulnerability. Use a unique passkey.',
          entropyBits: c.entropyScore,
        });
      }
    });

    return results;
  },
}));
