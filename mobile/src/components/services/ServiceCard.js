import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import colors from '../../constants/colors';

const ServiceCard = ({ service, onPress }) => (
  <View style={styles.wrapper}>
    <TouchableOpacity style={styles.card} onPress={() => onPress?.(service)} activeOpacity={0.8}>
      <Text style={styles.name}>{service.serviceName}</Text>
      <Text style={styles.price}>Rs. {service.price}</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    margin: 4,
  },
  name: { fontSize: 13, fontWeight: '700', color: colors.text },
  price: { fontSize: 11, color: colors.accent, marginTop: 4 },
});

export default ServiceCard;