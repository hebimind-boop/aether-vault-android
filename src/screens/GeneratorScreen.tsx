import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Switch,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import {
  KeyRound,
  RefreshCw,
  Copy,
  Check,
  Shield,
  Sliders,
  Sparkles,
  Lock,
  Plus,
} from 'lucide-react-native';
import { CryptoService, GeneratorOptions } from '../services/cryptoService';
import { useVaultStore } from '../store/useVaultStore';

export function GeneratorScreen() {
  const { addCredential, triggerClipboardAutoClear } = useVaultStore();

  const [options, setOptions] = useState<GeneratorOptions>({
    length: 24,
    useUpper: true,
    useLower: true,
    useNumbers: true,
    useSymbols: true,
    avoidAmbiguous: true,
    mode: 'password',
    wordCount: 4,
  });

  const [generated, setGenerated] = useState<{ value: string; entropyBits: number }>({
    value: '',
    entropyBits: 128,
  });
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Generate on mount or options change
  useEffect(() => {
    handleGenerate();
  }, [options]);

  const handleGenerate = () => {
    const result = CryptoService.generatePassword(options);
    setGenerated(result);
  };

  const handleCopy = async () => {
    if (!generated.value) return;
    await Clipboard.setStringAsync(generated.value);
    setCopied(true);
    triggerClipboardAutoClear(30);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleQuickSave = () => {
    addCredential({
      title: options.mode === 'password' ? 'Generated Key' : 'Generated Passphrase',
      category: 'login',
      password: generated.value,
      favorite: false,
      notes: `Generated with AetherVault (${generated.entropyBits} bits entropy).`,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const adjustLength = (delta: number) => {
    setOptions((prev) => ({
      ...prev,
      length: Math.max(8, Math.min(64, prev.length + delta)),
    }));
  };

  const adjustWordCount = (delta: number) => {
    setOptions((prev) => ({
      ...prev,
      wordCount: Math.max(3, Math.min(8, (prev.wordCount || 4) + delta)),
    }));
  };

  const getStrengthLabel = (bits: number) => {
    if (bits >= 110) return { label: 'MILITARY-GRADE (100+ BITS)', color: '#10b981' };
    if (bits >= 80) return { label: 'STRONG (80-109 BITS)', color: '#06b6d4' };
    if (bits >= 55) return { label: 'MODERATE (55-79 BITS)', color: '#f59e0b' };
    return { label: 'WEAK (<55 BITS)', color: '#ef4444' };
  };

  const strength = getStrengthLabel(generated.entropyBits);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <KeyRound size={22} color="#10b981" />
          <Text style={styles.headerTitle}>Entropy Engine</Text>
        </View>
        <Text style={styles.headerSub}>High-Resilience Cryptographic Generator</Text>
      </View>

      {/* Generated Result Card */}
      <View style={styles.resultCard}>
        <View style={styles.cardHeaderRow}>
          <View style={[styles.strengthBadge, { borderColor: strength.color }]}>
            <Shield size={12} color={strength.color} />
            <Text style={[styles.strengthText, { color: strength.color }]}>
              {strength.label}
            </Text>
          </View>
          <Text style={styles.entropyCount}>{generated.entropyBits} BITS</Text>
        </View>

        {/* Display Password */}
        <View style={styles.passwordDisplay}>
          <Text style={styles.passwordText}>{generated.value}</Text>
        </View>

        {/* Actions Row */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleGenerate}
          >
            <RefreshCw size={16} color="#06b6d4" />
            <Text style={styles.actionButtonText}>Regenerate</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButtonPrimary, copied && styles.actionButtonCopied]}
            onPress={handleCopy}
          >
            {copied ? (
              <>
                <Check size={16} color="#020617" />
                <Text style={styles.primaryButtonText}>Copied (Auto-Scrub 30s)</Text>
              </>
            ) : (
              <>
                <Copy size={16} color="#020617" />
                <Text style={styles.primaryButtonText}>Copy to Clipboard</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Mode Selector */}
      <View style={styles.modeContainer}>
        <TouchableOpacity
          onPress={() => setOptions((p) => ({ ...p, mode: 'password' }))}
          style={[
            styles.modeButton,
            options.mode === 'password' && styles.modeButtonSelected,
          ]}
        >
          <Text
            style={[
              styles.modeButtonText,
              options.mode === 'password' && styles.modeButtonTextSelected,
            ]}
          >
            Random Characters
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setOptions((p) => ({ ...p, mode: 'passphrase' }))}
          style={[
            styles.modeButton,
            options.mode === 'passphrase' && styles.modeButtonSelected,
          ]}
        >
          <Text
            style={[
              styles.modeButtonText,
              options.mode === 'passphrase' && styles.modeButtonTextSelected,
            ]}
          >
            Diceware Passphrase
          </Text>
        </TouchableOpacity>
      </View>

      {/* Generator Controls */}
      <View style={styles.settingsCard}>
        <View style={styles.settingsTitleRow}>
          <Sliders size={16} color="#64748b" />
          <Text style={styles.settingsTitle}>GENERATOR PARAMETERS</Text>
        </View>

        {options.mode === 'password' ? (
          <>
            {/* Length Stepper */}
            <View style={styles.stepperRow}>
              <View>
                <Text style={styles.settingLabel}>Password Length</Text>
                <Text style={styles.settingSub}>Characters count (8 to 64)</Text>
              </View>
              <View style={styles.stepperControls}>
                <TouchableOpacity
                  onPress={() => adjustLength(-2)}
                  style={styles.stepButton}
                >
                  <Text style={styles.stepButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.stepValue}>{options.length}</Text>
                <TouchableOpacity
                  onPress={() => adjustLength(2)}
                  style={styles.stepButton}
                >
                  <Text style={styles.stepButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Toggles */}
            <View style={styles.toggleRow}>
              <Text style={styles.settingLabel}>Uppercase Letters (A-Z)</Text>
              <Switch
                value={options.useUpper}
                onValueChange={(v) => setOptions((p) => ({ ...p, useUpper: v }))}
                thumbColor={options.useUpper ? '#10b981' : '#475569'}
                trackColor={{ false: '#1e293b', true: '#064e3b' }}
              />
            </View>

            <View style={styles.toggleRow}>
              <Text style={styles.settingLabel}>Lowercase Letters (a-z)</Text>
              <Switch
                value={options.useLower}
                onValueChange={(v) => setOptions((p) => ({ ...p, useLower: v }))}
                thumbColor={options.useLower ? '#10b981' : '#475569'}
                trackColor={{ false: '#1e293b', true: '#064e3b' }}
              />
            </View>

            <View style={styles.toggleRow}>
              <Text style={styles.settingLabel}>Digits (0-9)</Text>
              <Switch
                value={options.useNumbers}
                onValueChange={(v) => setOptions((p) => ({ ...p, useNumbers: v }))}
                thumbColor={options.useNumbers ? '#10b981' : '#475569'}
                trackColor={{ false: '#1e293b', true: '#064e3b' }}
              />
            </View>

            <View style={styles.toggleRow}>
              <Text style={styles.settingLabel}>Special Symbols (!@#$%)</Text>
              <Switch
                value={options.useSymbols}
                onValueChange={(v) => setOptions((p) => ({ ...p, useSymbols: v }))}
                thumbColor={options.useSymbols ? '#10b981' : '#475569'}
                trackColor={{ false: '#1e293b', true: '#064e3b' }}
              />
            </View>

            <View style={styles.toggleRow}>
              <Text style={styles.settingLabel}>Avoid Ambiguous (1, l, 0, O)</Text>
              <Switch
                value={options.avoidAmbiguous}
                onValueChange={(v) => setOptions((p) => ({ ...p, avoidAmbiguous: v }))}
                thumbColor={options.avoidAmbiguous ? '#10b981' : '#475569'}
                trackColor={{ false: '#1e293b', true: '#064e3b' }}
              />
            </View>
          </>
        ) : (
          /* Passphrase word count */
          <View style={styles.stepperRow}>
            <View>
              <Text style={styles.settingLabel}>Passphrase Word Count</Text>
              <Text style={styles.settingSub}>Diceware word list (3 to 8)</Text>
            </View>
            <View style={styles.stepperControls}>
              <TouchableOpacity
                onPress={() => adjustWordCount(-1)}
                style={styles.stepButton}
              >
                <Text style={styles.stepButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.stepValue}>{options.wordCount}</Text>
              <TouchableOpacity
                onPress={() => adjustWordCount(1)}
                style={styles.stepButton}
              >
                <Text style={styles.stepButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Save Directly To Vault Button */}
      <TouchableOpacity
        style={[styles.saveButton, savedSuccess && styles.saveButtonSuccess]}
        onPress={handleQuickSave}
      >
        {savedSuccess ? (
          <>
            <Check size={18} color="#10b981" />
            <Text style={styles.saveSuccessText}>Saved to AetherVault!</Text>
          </>
        ) : (
          <>
            <Plus size={18} color="#06b6d4" />
            <Text style={styles.saveButtonText}>Add Directly to Vault</Text>
          </>
        )}
      </TouchableOpacity>
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
  resultCard: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  strengthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: '#020617',
  },
  strengthText: {
    fontSize: 10,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  entropyCount: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
    fontFamily: 'monospace',
  },
  passwordDisplay: {
    marginTop: 16,
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#020617',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
    alignItems: 'center',
  },
  passwordText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
    fontFamily: 'monospace',
    letterSpacing: 1,
    textAlign: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#1e293b',
    paddingVertical: 12,
    borderRadius: 12,
  },
  actionButtonText: {
    color: '#06b6d4',
    fontSize: 13,
    fontWeight: '700',
  },
  actionButtonPrimary: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#10b981',
    paddingVertical: 12,
    borderRadius: 12,
  },
  actionButtonCopied: {
    backgroundColor: '#34d399',
  },
  primaryButtonText: {
    color: '#020617',
    fontSize: 13,
    fontWeight: '800',
  },
  modeContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#0f172a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
    alignItems: 'center',
  },
  modeButtonSelected: {
    borderColor: '#10b981',
    backgroundColor: '#064e3b40',
  },
  modeButtonText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  modeButtonTextSelected: {
    color: '#10b981',
    fontWeight: '700',
  },
  settingsCard: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    padding: 20,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  settingsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  settingsTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 1,
  },
  stepperRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  settingLabel: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
  },
  settingSub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  stepperControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#020617',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  stepButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  stepButtonText: {
    color: '#10b981',
    fontSize: 18,
    fontWeight: '800',
  },
  stepValue: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'monospace',
    minWidth: 24,
    textAlign: 'center',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b40',
  },
  saveButton: {
    marginTop: 20,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#06b6d4',
    paddingVertical: 14,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveButtonSuccess: {
    borderColor: '#10b981',
    backgroundColor: '#064e3b30',
  },
  saveButtonText: {
    color: '#06b6d4',
    fontSize: 14,
    fontWeight: '700',
  },
  saveSuccessText: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: '700',
  },
});
