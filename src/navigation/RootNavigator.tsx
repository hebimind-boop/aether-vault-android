import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import {
  ShieldCheck,
  KeyRound,
  ShieldAlert,
  HardDriveDownload,
} from 'lucide-react-native';

import { VaultDashboardScreen } from '../screens/VaultDashboardScreen';
import { GeneratorScreen } from '../screens/GeneratorScreen';
import { AuditScreen } from '../screens/AuditScreen';
import { BackupExportScreen } from '../screens/BackupExportScreen';

const Tab = createBottomTabNavigator();

const customDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#020617',
    card: '#020617',
    border: '#0f172a',
    primary: '#10b981',
    text: '#ffffff',
  },
};

export function RootNavigator() {
  return (
    <NavigationContainer theme={customDarkTheme}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: '#10b981',
          tabBarInactiveTintColor: '#64748b',
          tabBarLabelStyle: styles.tabBarLabel,
        }}
      >
        <Tab.Screen
          name="Vault"
          component={VaultDashboardScreen}
          options={{
            tabBarLabel: 'Vault',
            tabBarIcon: ({ color, size }) => (
              <ShieldCheck size={22} color={color} />
            ),
          }}
        />

        <Tab.Screen
          name="Generator"
          component={GeneratorScreen}
          options={{
            tabBarLabel: 'Generator',
            tabBarIcon: ({ color, size }) => (
              <KeyRound size={22} color={color} />
            ),
          }}
        />

        <Tab.Screen
          name="Audit"
          component={AuditScreen}
          options={{
            tabBarLabel: 'Audit',
            tabBarIcon: ({ color, size }) => (
              <ShieldAlert size={22} color={color} />
            ),
          }}
        />

        <Tab.Screen
          name="Backup"
          component={BackupExportScreen}
          options={{
            tabBarLabel: 'Backup',
            tabBarIcon: ({ color, size }) => (
              <HardDriveDownload size={22} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#020617',
    borderTopWidth: 1,
    borderTopColor: '#0f172a',
    height: 65,
    paddingBottom: 10,
    paddingTop: 8,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
});
