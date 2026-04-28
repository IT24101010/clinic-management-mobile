import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Switch, Platform, StatusBar,
  KeyboardAvoidingView, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../api/axiosConfig';
import ErrorAlert from '../../components/shared/ErrorAlert';
import ConfirmDialog from '../../components/shared/ConfirmDialog';

export default function ServiceFormScreen({ navigation, route }) {
  const existing = route?.params?.service;
  const isEdit   = !!existing;

  const [form, setForm] = useState({
    serviceName: existing?.serviceName  || '',
    category:    existing?.category     || '',
    description: existing?.description  || '',
    price:       existing?.price        != null ? String(existing.price)    : '',
    duration:    existing?.duration     != null ? String(existing.duration) : '',
    imageUrl:    existing?.imageUrl     || '',
    isActive:    existing?.isActive     !== undefined ? existing.isActive   : true,
  });

  const [saving,     setSaving]     = useState(false);
  const [deleting,   setDeleting]   = useState(false);
  const [error,      setError]      = useState('');
  const [confirmCfg, setConfirmCfg] = useState(null);

  const set = (key) => (val) => {
    setError('');
    setForm(f => ({ ...f, [key]: val }));
  };

  const validate = () => {
    if (!form.serviceName.trim())                             return 'Service name is required.';
    if (!form.price.trim() || isNaN(Number(form.price)))      return 'A valid price is required.';
    if (Number(form.price) < 0)                              return 'Price cannot be negative.';
    if (!form.duration.trim() || isNaN(Number(form.duration))) return 'A valid duration (minutes) is required.';
    if (Number(form.duration) <= 0)                          return 'Duration must be greater than 0.';
    return null;
  };

  const handleSave = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    setSaving(true);
    setError('');
    try {
      const payload = {
        serviceName: form.serviceName.trim(),
        category:    form.category.trim(),
        description: form.description.trim(),
        price:       Number(form.price),
        duration:    Number(form.duration),
        imageUrl:    form.imageUrl.trim(),
        isActive:    form.isActive,
      };
      if (isEdit) {
        await api.put(`/api/services/${existing._id}`, payload);
      } else {
        await api.post('/api/services', payload);
      }
      navigation.goBack();
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to save service');
      setSaving(false);
    }
  };

  // ── Hard delete ──────────────────────────────────────────────────────────
  const askHardDelete = () => setConfirmCfg({
    title:        'Permanently delete?',
    message:      `"${existing?.serviceName}" will be removed forever and cannot be recovered.`,
    confirmText:  'Delete permanently',
    confirmColor: '#D6574F',
    onConfirm: async () => {
      setConfirmCfg(null);
      setDeleting(true);
      try {
        await api.delete(`/api/services/${existing._id}/hard`);
        navigation.goBack();
      } catch (e) {
        setError(e?.response?.data?.message || 'Failed to delete');
        setDeleting(false);
      }
    },
  });

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color="#0E1422" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEdit ? 'Edit Service' : 'New Service'}</Text>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          {error ? <View style={{ marginBottom: 12 }}><ErrorAlert message={error} /></View> : null}

          <Text style={styles.label}>Service Name *</Text>
          <TextInput style={styles.input} value={form.serviceName} onChangeText={set('serviceName')} placeholder="e.g. Dental Checkup" />

          <Text style={styles.label}>Category</Text>
          <TextInput style={styles.input} value={form.category} onChangeText={set('category')} placeholder="e.g. Dental, General" />

          <Text style={styles.label}>Description</Text>
          <TextInput style={[styles.input, styles.textarea]} value={form.description} onChangeText={set('description')} placeholder="Brief description…" multiline numberOfLines={4} />

          <Text style={styles.label}>Price (Rs.) *</Text>
          <TextInput style={styles.input} value={form.price} onChangeText={set('price')} placeholder="0" keyboardType="numeric" />

          <Text style={styles.label}>Duration (min) *</Text>
          <TextInput style={styles.input} value={form.duration} onChangeText={set('duration')} placeholder="30" keyboardType="numeric" />

          <Text style={styles.label}>Image URL</Text>
          <TextInput style={styles.input} value={form.imageUrl} onChangeText={set('imageUrl')} placeholder="https://…" keyboardType="url" autoCapitalize="none" />

          <View style={styles.toggleRow}>
            <Text style={styles.label}>Active</Text>
            <Switch value={form.isActive} onValueChange={set('isActive')} />
          </View>

          <TouchableOpacity onPress={handleSave} disabled={saving} style={styles.saveBtn}>
            {saving
              ? <ActivityIndicator size="small" color="#fff" />
              : <Text style={styles.saveBtnText}>{isEdit ? 'Save changes' : 'Create service'}</Text>
            }
          </TouchableOpacity>

          {/* ── Danger zone ── */}
          {isEdit && (
            <View style={styles.dangerZone}>
              <Text style={styles.dangerTitle}>Danger zone</Text>
              <Text style={styles.dangerNote}>
                Permanently deletes this service and all associated data. This action cannot be undone.
              </Text>
              <TouchableOpacity
                onPress={askHardDelete}
                disabled={deleting}
                style={[styles.dangerBtn, deleting && { opacity: 0.7 }]}
              >
                {deleting
                  ? <ActivityIndicator size="small" color="#D6574F" />
                  : <Ionicons name="trash-outline" size={15} color="#D6574F" />
                }
                <Text style={styles.dangerBtnText}>
                  {deleting ? 'Deleting…' : 'Permanently delete service'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

        </ScrollView>
      </KeyboardAvoidingView>

      {confirmCfg && (
        <ConfirmDialog
          visible
          title={confirmCfg.title}
          message={confirmCfg.message}
          confirmText={confirmCfg.confirmText}
          confirmColor={confirmCfg.confirmColor}
          onConfirm={confirmCfg.onConfirm}
          onCancel={() => setConfirmCfg(null)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root:        { flex: 1, backgroundColor: '#F4F5F7' },
  header:      { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 10 : 52, paddingHorizontal: 16, paddingBottom: 14 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#0E1422' },
  scroll:      { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 100 },
  label:       { fontSize: 12, fontWeight: '600', color: '#3A4254', marginBottom: 6, marginTop: 12 },
  input:       { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#E3E6EC', paddingHorizontal: 14, height: 46, fontSize: 14, color: '#0E1422' },
  textarea:    { height: 96, paddingTop: 12, textAlignVertical: 'top' },
  toggleRow:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 },
  saveBtn:     { marginTop: 24, backgroundColor: '#0E1422', borderRadius: 14, paddingVertical: 15, alignItems: 'center', justifyContent: 'center' },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  dangerZone:  { marginTop: 20, borderRadius: 16, padding: 16, backgroundColor: '#fff', borderWidth: 1, borderColor: '#F0C2C0' },
  dangerTitle: { fontSize: 13, fontWeight: '700', color: '#D6574F', marginBottom: 6 },
  dangerNote:  { fontSize: 12, color: '#7A8296', lineHeight: 17, marginBottom: 12 },
  dangerBtn:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 12, backgroundColor: '#FADBD9', borderWidth: 1, borderColor: '#F0C2C0' },
  dangerBtnText: { fontSize: 13, fontWeight: '700', color: '#D6574F' },
});