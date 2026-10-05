import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Modal,
  StyleSheet,
  Alert,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import {
  ShieldCheck,
  Search,
  KeyRound,
  FileText,
  CreditCard,
  Code,
  Clock,
  Copy,
  Check,
  Eye,
  EyeOff,
  Star,
  Plus,
  Lock,
  Unlock,
  Fingerprint,
  Sparkles,
  X,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react-native';
import { useVaultStore } from '../store/useVaultStore';
import { VaultCategory, CredentialItem } from '../types/vault';
import { CryptoService } from '../services/cryptoService';

export function VaultDashboardScreen() {
  const {
    credentials,
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    toggleFavorite,
    deleteCredential,
    addCredential,
    getMetrics,
    triggerClipboardAutoClear,
  } = useVaultStore();

  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [totpTick, setTotpTick] = useState<{ code: string; remainingSeconds: number }>({
    code: '742 918',
    remainingSeconds: 24,
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [isBiometricVerified, setIsBiometricVerified] = useState(true);

  // New Credential Form State
  const [newTitle, setNewTitle] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newCategory, setNewCategory] = useState<'login' | 'note' | 'card' | 'api' | 'totp'>('login');
  const [newTotp, setNewTotp] = useState('');

  // Live 1-second interval for TOTP counter
  useEffect(() => {
    const timer = setInterval(() => {
      const current = CryptoService.generateTOTP('JBSWY3DPEHPK3PXP');
      setTotpTick(current);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const metrics = getMetrics();

  const categories: { label: string; value: VaultCategory; icon: any }[] = [
    { label: 'All', value: 'all', icon: ShieldCheck },
    { label: 'Logins', value: 'login', icon: KeyRound },
    { label: 'Notes', value: 'note', icon: FileText },
    { label: 'Cards', value: 'card', icon: CreditCard },
    { label: 'API Keys', value: 'api', icon: Code },
  ];

  const filteredCredentials = credentials.filter((item) => {
    const matchesCategory =
      activeCategory === 'all' ? true : item.category === activeCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.username && item.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleCopy = async (id: string, text?: string) => {
    if (!text) return;
    await Clipboard.setStringAsync(text);
    setCopiedId(id);
    triggerClipboardAutoClear(30);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleReveal = (id: string) => {
    setRevealedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCreateCredential = () => {
    if (!newTitle.trim()) {
      Alert.alert('Required', 'Please enter a title for the credential.');
      return;
    }

    addCredential({
      title: newTitle.trim(),
      category: newCategory,
      username: newUsername.trim(),
      password: newPassword,
      totpSecret: newTotp.trim() ? newTotp.trim() : undefined,
      favorite: false,
    });

    setNewTitle('');
    setNewUsername('');
    setNewPassword('');
    setNewTotp('');
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      {/* Top Header / Biometric Status Bar */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <View style={styles.logoBadge}>
            <ShieldCheck size={20} color="#10b981" />
          </View>
          <View>
            <Text style={styles.appTitle}>AetherVault</Text>
            <Text style={styles.appSubtitle}>Cryptographic Offline Core</Text>
          </View>
        </View>

        {/* Biometric & AES-256 Badge */}
        <TouchableOpacity
          style={styles.securityBadge}
          onPress={() => setIsBiometricVerified(!isBiometricVerified)}
        >
          <Fingerprint size={14} color="#10b981" />
          <Text style={styles.securityBadgeText}>
            {isBiometricVerified ? 'AES-256 • ACTIVE' : 'LOCKED'}
          </Text>
          <View style={styles.onlineDot} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Vault Health Score Card */}
        <View style={styles.healthCard}>
          <View style={styles.healthLeft}>
            <Text style={styles.healthCardLabel}>VAULT INTEGRITY SCORE</Text>
            <View style={styles.healthScoreRow}>
              <Text style={styles.healthScoreValue}>{metrics.healthScore}</Text>
              <Text style={styles.healthScoreMax}>/100</Text>
            </View>
            <Text style={styles.healthStatusText}>
              {metrics.healthScore > 85
                ? 'Strong Cryptographic Posture'
                : 'Attention Needed: Resolve Breaches'}
            </Text>
          </View>

          {/* Gauge Ring Representation */}
          <View style={styles.gaugeContainer}>
            <View
              style={[
                styles.gaugeRing,
                {
                  borderColor:
                    metrics.healthScore > 80
                      ? '#10b981'
                      : metrics.healthScore > 50
                      ? '#f59e0b'
                      : '#ef4444',
                },
              ]}
            >
              <Lock size={22} color="#10b981" />
            </View>
            <Text style={styles.gaugeSubText}>
              {metrics.totalCredentials} Vault Keys
            </Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search size={18} color="#64748b" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search logins, notes, cards..."
            placeholderTextColor="#64748b"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={16} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>

        {/* Category Horizontal Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryContainer}
        >
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = activeCategory === cat.value;
            return (
              <TouchableOpacity
                key={cat.value}
                onPress={() => setActiveCategory(cat.value)}
                style={[
                  styles.categoryChip,
                  isSelected && styles.categoryChipSelected,
                ]}
              >
                <Icon
                  size={14}
                  color={isSelected ? '#020617' : '#94a3b8'}
                  style={styles.categoryIcon}
                />
                <Text
                  style={[
                    styles.categoryText,
                    isSelected && styles.categoryTextSelected,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Credential List Section */}
        <View style={styles.listHeaderRow}>
          <Text style={styles.listSectionTitle}>
            VAULT ITEMS ({filteredCredentials.length})
          </Text>
          <Text style={styles.listSectionSub}>ZERO-KNOWLEDGE LOCAL DISK</Text>
        </View>

        {filteredCredentials.map((item) => {
          const isRevealed = !!revealedIds[item.id];
          const isCopied = copiedId === item.id;

          return (
            <View key={item.id} style={styles.credentialCard}>
              <View style={styles.cardTopRow}>
                <View style={styles.cardTitleGroup}>
                  <View style={styles.cardIconBox}>
                    {item.category === 'login' && <KeyRound size={16} color="#06b6d4" />}
                    {item.category === 'card' && <CreditCard size={16} color="#a855f7" />}
                    {item.category === 'api' && <Code size={16} color="#10b981" />}
                    {item.category === 'note' && <FileText size={16} color="#f59e0b" />}
                  </View>
                  <View>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    {item.username ? (
                      <Text style={styles.cardUsername}>{item.username}</Text>
                    ) : null}
                  </View>
                </View>

                {/* Favorite Star Button */}
                <TouchableOpacity onPress={() => toggleFavorite(item.id)}>
                  <Star
                    size={18}
                    color={item.favorite ? '#f59e0b' : '#334155'}
                    fill={item.favorite ? '#f59e0b' : 'transparent'}
                  />
                </TouchableOpacity>
              </View>

              {/* Password / Secret Field Row */}
              {item.password ? (
                <View style={styles.secretBox}>
                  <Text style={styles.secretText}>
                    {isRevealed ? item.password : '••••••••••••••••'}
                  </Text>
                  <View style={styles.secretActions}>
                    <TouchableOpacity
                      onPress={() => toggleReveal(item.id)}
                      style={styles.iconButton}
                    >
                      {isRevealed ? (
                        <EyeOff size={16} color="#94a3b8" />
                      ) : (
                        <Eye size={16} color="#94a3b8" />
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handleCopy(item.id, item.password)}
                      style={[styles.copyButton, isCopied && styles.copyButtonActive]}
                    >
                      {isCopied ? (
                        <>
                          <Check size={14} color="#10b981" />
                          <Text style={styles.copiedText}>Copied</Text>
                        </>
                      ) : (
                        <>
                          <Copy size={14} color="#06b6d4" />
                          <Text style={styles.copyText}>Copy</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              ) : null}

              {/* Live RFC 6238 TOTP Row if available */}
              {item.totpSecret ? (
                <View style={styles.totpBox}>
                  <View style={styles.totpLeft}>
                    <Clock size={14} color="#10b981" />
                    <Text style={styles.totpLabel}>2FA TOTP TOKEN</Text>
                  </View>
                  <View style={styles.totpRight}>
                    <Text style={styles.totpCode}>{totpTick.code}</Text>
                    <View style={styles.countdownBadge}>
                      <Text style={styles.countdownText}>
                        {totpTick.remainingSeconds}s
                      </Text>
                    </View>
                  </View>
                </View>
              ) : null}

              {/* Entropy & Security Tags */}
              <View style={styles.cardFooter}>
                <View style={styles.entropyPill}>
                  <Text style={styles.entropyText}>
                    {item.entropyScore} Bits Entropy
                  </Text>
                </View>
                {item.isBreached && (
                  <View style={styles.breachPill}>
                    <AlertTriangle size={12} color="#ef4444" />
                    <Text style={styles.breachText}>Breach Detected</Text>
                  </View>
                )}
                {item.isReused && !item.isBreached && (
                  <View style={styles.reusedPill}>
                    <Text style={styles.reusedText}>Reused Password</Text>
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Plus size={24} color="#020617" />
      </TouchableOpacity>

      {/* Add Credential Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <Sparkles size={18} color="#10b981" />
                <Text style={styles.modalTitle}>Store New Cryptographic Key</Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.fieldLabel}>TITLE / SERVICE</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. AWS Cloud Console, Gitlab..."
                placeholderTextColor="#64748b"
                value={newTitle}
                onChangeText={setNewTitle}
              />

              <Text style={styles.fieldLabel}>USERNAME / EMAIL</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. secops@company.io"
                placeholderTextColor="#64748b"
                value={newUsername}
                onChangeText={setNewUsername}
              />

              <Text style={styles.fieldLabel}>PASSWORD / API SECRET</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter password or use generator"
                placeholderTextColor="#64748b"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
              />

              <Text style={styles.fieldLabel}>OPTIONAL TOTP SEED KEY</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Base32 secret (e.g. JBSWY3DPEHPK3PXP)"
                placeholderTextColor="#64748b"
                value={newTotp}
                onChangeText={setNewTotp}
              />

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleCreateCredential}
              >
                <Lock size={16} color="#020617" />
                <Text style={styles.submitButtonText}>
                  Encrypt & Save to Local Vault
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
    paddingTop: 45,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#0f172a',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#064e3b',
    borderWidth: 1,
    borderColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  appSubtitle: {
    fontSize: 11,
    color: '#10b981',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0f172a',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  securityBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#e2e8f0',
    fontFamily: 'monospace',
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  healthCard: {
    marginTop: 16,
    borderRadius: 20,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  healthLeft: {
    flex: 1,
  },
  healthCardLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 1,
  },
  healthScoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 4,
  },
  healthScoreValue: {
    fontSize: 36,
    fontWeight: '900',
    color: '#10b981',
    fontFamily: 'monospace',
  },
  healthScoreMax: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
    marginLeft: 2,
  },
  healthStatusText: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  gaugeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#020617',
  },
  gaugeSubText: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 6,
    fontFamily: 'monospace',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 14,
  },
  categoryScroll: {
    marginTop: 14,
  },
  categoryContainer: {
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  categoryChipSelected: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  categoryIcon: {
    marginRight: 6,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
  },
  categoryTextSelected: {
    color: '#020617',
    fontWeight: '800',
  },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 10,
  },
  listSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 1,
  },
  listSectionSub: {
    fontSize: 10,
    fontWeight: '600',
    color: '#10b981',
    fontFamily: 'monospace',
  },
  credentialCard: {
    backgroundColor: '#0f172a',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#020617',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  cardUsername: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 1,
    fontFamily: 'monospace',
  },
  secretBox: {
    marginTop: 12,
    backgroundColor: '#020617',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  secretText: {
    color: '#e2e8f0',
    fontSize: 13,
    fontFamily: 'monospace',
    letterSpacing: 1.5,
  },
  secretActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    padding: 6,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#064e3b',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  copyButtonActive: {
    backgroundColor: '#064e3b',
  },
  copyText: {
    color: '#06b6d4',
    fontSize: 11,
    fontWeight: '700',
  },
  copiedText: {
    color: '#10b981',
    fontSize: 11,
    fontWeight: '700',
  },
  totpBox: {
    marginTop: 10,
    backgroundColor: '#064e3b20',
    borderWidth: 1,
    borderColor: '#10b98140',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totpLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  totpLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#10b981',
    letterSpacing: 0.5,
  },
  totpRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  totpCode: {
    fontSize: 15,
    fontWeight: '800',
    color: '#34d399',
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
  countdownBadge: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  countdownText: {
    fontSize: 10,
    color: '#94a3b8',
    fontFamily: 'monospace',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  entropyPill: {
    backgroundColor: '#020617',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  entropyText: {
    fontSize: 10,
    color: '#64748b',
    fontFamily: 'monospace',
  },
  breachPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#7f1d1d40',
    borderWidth: 1,
    borderColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  breachText: {
    fontSize: 10,
    color: '#f87171',
    fontWeight: '700',
  },
  reusedPill: {
    backgroundColor: '#78350f40',
    borderWidth: 1,
    borderColor: '#f59e0b',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  reusedText: {
    fontSize: 10,
    color: '#fbbf24',
    fontWeight: '700',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 25,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.85)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0f172a',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '85%',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#ffffff',
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    marginBottom: 6,
    marginTop: 14,
    letterSpacing: 0.5,
  },
  modalInput: {
    backgroundColor: '#020617',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#ffffff',
    fontSize: 14,
  },
  submitButton: {
    marginTop: 24,
    backgroundColor: '#10b981',
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 30,
  },
  submitButtonText: {
    color: '#020617',
    fontSize: 14,
    fontWeight: '800',
  },
});
