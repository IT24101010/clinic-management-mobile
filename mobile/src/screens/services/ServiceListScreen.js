import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  RefreshControl, StatusBar,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../api/axiosConfig';
import colors from '../../constants/colors';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ErrorAlert from '../../components/shared/ErrorAlert';
import EmptyState from '../../components/shared/EmptyState';
import ServiceCard from '../../components/services/ServiceCard';

const ServiceListScreen = ({ navigation }) => {
  const [services,   setServices]   = useState([]);
  const [filtered,   setFiltered]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error,      setError]      = useState('');
  const [activeCat,  setActiveCat]  = useState('All');
  const [categories, setCategories] = useState(['All']);

  const fetchServices = useCallback(async () => {
    try {
      setError('');
      const { data } = await api.get('/api/services');
      const list = Array.isArray(data) ? data : [];
      setServices(list);
      const cats = ['All', ...new Set(list.map((s) => s.category).filter(Boolean))];
      setCategories(cats);
    } catch {
      setError('Failed to load services. Pull to refresh.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchServices(); }, [fetchServices]));

  useEffect(() => {
    let result = services;
    if (activeCat !== 'All') result = result.filter((s) => s.category === activeCat);
    setFiltered(result);
  }, [activeCat, services]);

  const handleServicePress = (service) => navigation.navigate('ServiceDetail', { service });

  if (loading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {error ? <ErrorAlert message={error} /> : null}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item._id}
        numColumns={2}
        renderItem={({ item, index }) => (
          <ServiceCard service={item} onPress={handleServicePress} index={index} />
        )}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchServices(); }}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }
        ListEmptyComponent={
          !error ? (
            <EmptyState
              iconName="grid-outline"
              title="No services found"
              subtitle="No services are available right now"
            />
          ) : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  row: { paddingHorizontal: 16, gap: 12, marginBottom: 12 },
  listContent: { paddingTop: 12, paddingBottom: 140 },
});

export default ServiceListScreen;