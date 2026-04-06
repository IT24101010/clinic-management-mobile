import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../../constants/colors';

const LoginScreen = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Login Screen</Text>
    <Text style={styles.subtitle}>Coming Soon — Hiruna</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  title: { fontSize: 20, fontWeight: 'bold', color: colors.text, marginBottom: 8 },
  subtitle: { fontSize: 14, color: colors.textSecondary },
});

export default LoginScreen;
