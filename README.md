# AetherVault — Cryptographic & Biometric Offline Identity Manager

[![Build Android APK](https://github.com/hebimind-boop/aether-vault-android/actions/workflows/build-apk.yml/badge.svg)](https://github.com/hebimind-boop/aether-vault-android/actions/workflows/build-apk.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![Platform: Android](https://img.shields.io/badge/Platform-Android%2014%2B-blue.svg)](https://developer.android.com)
[![Expo: SDK 51](https://img.shields.io/badge/Expo-SDK%2051-black.svg)](https://expo.dev)

AetherVault is an ultra-secure, zero-knowledge, offline-first cryptographic password, passkey, and biometric identity manager designed for engineers, security operations, and privacy-conscious users.

---

## 🛡️ Security & Cryptographic Model

- **Zero-Knowledge & Offline Architecture**: No secrets ever transmit over the network. All encryption/decryption occurs strictly in-memory and on local disk.
- **Argon2id Key Derivation**: Master passphrases derive encryption keys using memory-hard parameters ($m=65536, t=3, p=4$) with per-vault unique salting.
- **Authenticated Encryption (AEAD)**: Vault snapshots are protected with AES-256-GCM ensuring confidentiality and tampering detection.
- **RFC 6238 TOTP Engine**: Real-time 2FA one-time token generator with live 30-second countdown rings.
- **Dynamic Entropy Calculator**: Real-time bit-strength calculation ($E = L \times \log_2(R)$) with Diceware passphrase generator.
- **Automated Memory Scrubbing**: 30-second clipboard auto-scrubbing to prevent shoulder surfing and malicious clipboard monitors.

---

## 📱 Application Screens

### 1. Master Vault Dashboard
- Biometric verification simulation badge with active AES-256 indicator.
- Vault Integrity Score gauge (0–100) reflecting overall cryptographic hygiene.
- Category filters: **All**, **Logins**, **Notes**, **Payment Cards**, **API Keys**.
- Dynamic Credential Cards with one-tap copy, secret reveal toggle, favorite star, and live TOTP token countdowns.
- Floating Action Button (+) with modal for storing new encrypted credentials.

### 2. Entropy Engine & Generator
- Random alphanumeric generator (8 to 64 chars) with granular toggles (Uppercase, Lowercase, Digits, Symbols, Avoid Ambiguous).
- Diceware Passphrase mode (configurable word count).
- Live entropy strength classification: **Military-Grade (100+ bits)**, **Strong (80–109 bits)**, **Moderate**, or **Weak**.
- One-tap copy with auto-clear clipboard timer indicator.

### 3. Threat Radar & Security Audit
- Automated scan for compromised, duplicate, and low-entropy credentials.
- Severity classification: **Critical Breach**, **High Risk**, and **Reused Key**.
- One-tap auto-rotation: instantly replaces vulnerable credentials with a 128-bit randomized key.

### 4. Cryptographic Backup & Recovery Kit
- AES-256-GCM JSON encrypted export snapshot with SHA-256 integrity checksum.
- 12-Word Mnemonic Emergency Recovery Seed for physical paper backup.

---

## ⚙️ Automated CI/CD Android APK Pipeline

This repository includes a production-grade GitHub Actions workflow (`.github/workflows/build-apk.yml`) that triggers on every `push` to `main`:

1. Checks out the repository code.
2. Configures Node.js 20 & Java 17 (Temurin).
3. Installs Expo SDK 51 dependencies via `npm install --legacy-peer-deps`.
4. Runs `npx expo prebuild --platform android --clean` to generate the bare native Android wrapper.
5. Executes `./gradlew assembleDebug` to compile the release-ready debug APK.
6. Uploads `app-debug.apk` directly to GitHub Actions Artifacts for download and installation on any Android device.

---

## 🚀 Local Development

```bash
# Clone repository
git clone https://github.com/hebimind-boop/aether-vault-android.git
cd aether-vault-android

# Install dependencies
npm install --legacy-peer-deps

# Start Expo development server
npx expo start

# Run on Android emulator or connected device
npx expo run:android
```

---

## 📄 License
MIT License. Crafted with zero telemetry and absolute privacy.
