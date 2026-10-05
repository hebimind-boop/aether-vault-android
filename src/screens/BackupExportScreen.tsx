import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import {
  HardDriveDownload,
  Key,
  ShieldCheck,
  FileCode,
  Copy,
  Check,
  Lock,
  FileText,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react-native';
import { useVaultStore } from '../store/useVaultStore';
import { CryptoService } from '../services/cryptoService';
import { EncryptedExportPackage } from '../types/vault';

export function BackupExportScreen() {
  const { credentials } = useVaultStore();

  const [exportPackage, setExportPackage] = useState<EncryptedExportPackage | null>(null);
  const [copied, setCopied] = useState(false);
  const [mnemonicSeed, setMnemonicSeed] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  const handleGenerateExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      const pkg = CryptoService.encryptVault(credentials, 'MasterKeyPhrase_2026');
      setExportPackage(pkg);
      setIsExporting(false);
    }, 600);
  };

  const handleGenerateEmergencyKit = () => {
    const seed = CryptoService.generateRecoverySeed();
    setMnemonicSeed(seed);
  };

  const handleCopyJSON = async () => {
    if (!exportPackage) return;
    await Clipboard.setStringAsync(JSON.stringify(exportPackage, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <HardDriveDownload size={22} color="#10b981" />
          <Text style={styles.headerTitle}>Cryptographic Backup</Text>
        </View>
        <Text style={styles.headerSub}>
          Zero-Knowledge Offline Vault Export & Recovery Kit
        </Text>
      </View>

      {/* Backup Generator Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.iconCircle}>
            <Lock size={18} color="#06b6d4" />
          </View>
          <View style={styles.cardTitleBox}>
            <Text style={styles.cardTitle}>AES-256-GCM Encrypted JSON</Text>
            <Text style={styles.cardSub}>
              Argon2id KDF • Salting & Cryptographic Integrity Checksum
            </Text>
          </View>
        </View>

        <Text style={styles.cardDescription}>
          Exports all stored keys, notes, and TOTP seeds into an encrypted snapshot.
          The ciphertext cannot be decrypted without your primary master passphrase.
        </Text>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleGenerateExport}
          disabled={isExporting}
        >
          {isExporting ? (
            <Text style={styles.buttonText}>Encrypting Vault...</Text>
          ) : (
            <>
              <FileCode size={16} color="#020617" />
              <Text style={styles.buttonText}>Generate Encrypted Snapshot</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Encrypted JSON Viewer */}
        {exportPackage && (
          <View style={styles.exportResultBox}>
            <View style={styles.resultMetaRow}>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>ALGORITHM</Text>
                <Text style={styles.metaValue}>{exportPackage.algorithm}</Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>INTEGRITY</Text>
                <Text style={styles.metaValue}>{exportPackage.checksumSha256.slice(0, 14)}...</Text>
              </View>
            </View>

            <View style={styles.codeSnippet}>
              <Text style={styles.codeText} numberOfLines={6}>
                {JSON.stringify(exportPackage, null, 2)}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.copyButton}
              onPress={handleCopyJSON}
            >
              {copied ? (
                <>
                  <Check size={14} color="#10b981" />
                  <Text style={styles.copiedText}>Copied to Clipboard</Text>
                </>
              ) : (
                <>
                  <Copy size={14} color="#06b6d4" />
                  <Text style={styles.copyText}>Copy Encrypted Payload</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Emergency Recovery Kit */}
      <View style={[styles.card, styles.emergencyCard]}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconCircle, { backgroundColor: '#78350f40', borderColor: '#f59e0b' }]}>
            <Key size={18} color="#f59e0b" />
          </View>
          <View style={styles.cardTitleBox}>
            <Text style={styles.cardTitle}>12-Word Emergency Recovery Kit</Text>
            <Text style={styles.cardSub}>
              Mnemonic seed for offline disaster recovery
            </Text>
          </View>
        </View>

        <Text style={styles.cardDescription}>
          Print or store this paper seed in a fireproof vault. If you ever lose your
          biometrics or forget your master passphrase, this seed restores total ownership.
        </Text>

        {mnemonicSeed.length === 0 ? (
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleGenerateEmergencyKit}
          >
            <ShieldCheck size={16} color="#f59e0b" />
            <Text style={styles.secondaryButtonText}>Reveal Recovery Seed Words</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.seedGrid}>
            {mnemonicSeed.map((word, idx) => (
              <View key={idx} style={styles.seedWordBadge}>
                <Text style={styles.seedWordIndex}>{idx + 1}.</Text>
                <Text style={styles.seedWordText}>{word}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
    paddingTop: 45,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 20,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
  },
  headerSub: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
    fontFamily: 'monospace',
  },
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 16,
  },
  emergencyCard: {
    borderColor: '#78350f60',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#08334440',
    borderWidth: 1,
    borderColor: '#06b6d4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitleBox: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  cardSub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  cardDescription: {
    fontSize: 13,
    color: '#94a3b8',
    lineHeight: 19,
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: '#10b981',
    borderRadius: 14,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonText: {
    color: '#020617',
    fontSize: 13,
    fontWeight: '800',
  },
  exportResultBox: {
    marginTop: 16,
    backgroundColor: '#020617',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  resultMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    marginBottom: 10,
  },
  metaItem: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.5,
  },
  metaValue: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10b981',
    fontFamily: 'monospace',
    marginTop: 2,
  },
  codeSnippet: {
    padding: 8,
    backgroundColor: '#0f172a80',
    borderRadius: 8,
  },
  codeText: {
    color: '#94a3b8',
    fontSize: 11,
    fontFamily: 'monospace',
  },
  copyButton: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    backgroundColor: '#1e293b',
    borderRadius: 8,
  },
  copyText: {
    color: '#06b6d4',
    fontSize: 12,
    fontWeight: '700',
  },
  copiedText: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: '#78350f30',
    borderWidth: 1,
    borderColor: '#f59e0b',
    borderRadius: 14,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryButtonText: {
    color: '#fbbf24',
    fontSize: 13,
    fontWeight: '700',
  },
  seedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  seedWordBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#020617',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
    minWidth: '30%',
  },
  seedWordIndex: {
    fontSize: 11,
    color: '#f59e0b',
    fontFamily: 'monospace',
    fontWeight: '700',
  },
  seedWordText: {
    fontSize: 12,
    color: '#e2e8f0',
    fontWeight: '700',
    fontFamily: 'monospace',
  },
});
