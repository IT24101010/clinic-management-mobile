import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ServiceCard = () => (
  <View style={styles.container}>
    <Text style={styles.title}>ServiceCard</Text>
    <Text style={styles.subtitle}>Component by Shehani</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#FFFFFF', borderRadius: 8, margin: 8, borderWidth: 1, borderColor: '#E5E7EB' },
  title: { fontSize: 16, fontWeight: 'bold', color: '#111827' },
  subtitle: { fontSize: 12, color: '#6B7280' },
});

export default ServiceCard;
