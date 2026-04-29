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

// ── Design tokens (basic) ─────────────────────────────────────────────────────
const T = {
  bg:        '#F4F5F7',
  card:      '#FFFFFF',
  line2:     '#E3E6EC',
  ink:       '#0E1422',
  ink2:      '#3A4254',
  muted:     '#7A8296',
  muted2:    '#A7ADBB',
  accent:    '#0B5FFF',
  accentSoft:'#E7EFFF',
  danger:    '#D6574F',
  dangerSoft:'#FADBD9',
};

// ── Sub-components ────────────────────────────────────────────────────────────

const FieldLabel = ({ label, required }) => (
  <Text style={styles.fieldLabel}>
    {label}
    {required ? <Text style={{ color: T.danger }}> *</Text> : null}
  </Text>
);

const InputField = ({
  label, required, value, onChangeText, placeholder,
  keyboardType, multiline, numberOfLines, autoCapitalize, flex,
}) => {
  const [focused, setFocused] = useState(false);
  return (
    <View style={[styles.fieldWrap, flex && { flex }]}>
      <FieldLabel label={label} required={required} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={T.muted2}
        keyboardType={keyboardType || 'default'}
        multiline={multiline}
        numberOfLines={numberOfLines}
        autoCapitalize={autoCapitalize || 'sentences'}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[
          styles.input,
          multiline && styles.textarea,
          focused && styles.inputFocused,
        ]}
      />
    </View>
  );
};

// ── Main Screen ───────────────────────────────────────────────────────────────

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
    if (!form.serviceName.trim())                              return 'Service name is required.';
    if (!form.price.trim() || isNaN(Number(form.price)))       return 'A valid price is required.';
    if (Number(form.price) < 0)                               return 'Price cannot be negative.';
    if (!form.duration.trim() || isNaN(Number(form.duration))) return 'A valid duration (minutes) is required.';
    if (Number(form.duration) <= 0)                           return 'Duration must be greater than 0.';
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

  const askHardDelete = () => setConfirmCfg({
    title:        'Permanently delete?',
    message:      `"${existing?.serviceName}" will be removed forever and cannot be recovered.`,
    confirmText:  'Delete permanently',
    confirmColor: T.danger,
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

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color={T.ink2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEdit ? 'Edit Service' : 'New Service'}</Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {error ? <View style={{ marginBottom: 12 }}><ErrorAlert message={error} /></View> : null}

          {/* All fields now use InputField */}
          <InputField
            label="Service name" required
            value={form.serviceName} onChangeText={set('serviceName')}
            placeholder="e.g. Dental Checkup"
          />
          <InputField
            label="Category"
            value={form.category} onChangeText={set('category')}
            placeholder="e.g. Dental, General, Lab"
          />
          <InputField
            label="Description"
            value={form.description} onChangeText={set('description')}
            placeholder="Brief description of the service…"
            multiline numberOfLines={4}
          />

          {/* Price and duration side by side */}
          <View style={styles.rowFields}>
            <InputField
              label="Price (Rs.)" required flex={1}
              value={form.price} onChangeText={set('price')}
              placeholder="0" keyboardType="numeric" autoCapitalize="none"
            />
            <InputField
              label="Duration (min)" required flex={1}
              value={form.duration} onChangeText={set('duration')}
              placeholder="30" keyboardType="numeric" autoCapitalize="none"
            />
          </View>

          <InputField
            label="Image URL"
            value={form.imageUrl} onChangeText={set('imageUrl')}
            placeholder="https://example.com/image.jpg"
            keyboardType="url" autoCapitalize="none"
          />

          {/* Availability toggle */}
          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.toggleLabel}>Service active</Text>
              <Text style={styles.toggleSub}>
                {form.isActive
                  ? 'Visible to patients in the services list'
                  : 'Hidden — patients cannot book this service'}
              </Text>
            </View>
            <Switch
              value={form.isActive}
              onValueChange={set('isActive')}
              trackColor={{ false: T.line2, true: '#0F9D7A' }}
              thumbColor="#fff"
            />
          </View>

          {/* Save button */}
          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            style={[styles.saveBtn, saving && { opacity: 0.7 }]}
            activeOpacity={0.9}
          >
            {saving
              ? <ActivityIndicator size="small" color="#fff" />
              : <Text style={styles.saveBtnText}>{isEdit ? 'Save changes' : 'Create service'}</Text>
            }
          </TouchableOpacity>

          {/* Danger zone */}
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
                activeOpacity={0.85}
              >
                {deleting
                  ? <ActivityIndicator size="small" color={T.danger} />
                  : <Ionicons name="trash-outline" size={15} color={T.danger} />
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

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 10 : 52,
    paddingHorizontal: 16, paddingBottom: 14,
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: T.ink },
  scroll: {
    paddingHorizontal: 16, paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 120 : 100,
  },

  /* InputField */
  fieldWrap:    { marginBottom: 12 },
  fieldLabel:   { fontSize: 11.5, color: T.ink2, fontWeight: '600', marginBottom: 6, letterSpacing: 0.1 },
  input: {
    height: 46, backgroundColor: T.card, borderRadius: 12,
    borderWidth: 1, borderColor: T.line2,
    paddingHorizontal: 14, fontSize: 13.5, color: T.ink,
  },
  textarea:     { height: 96, paddingTop: 12, paddingBottom: 12, textAlignVertical: 'top' },
  inputFocused: { borderColor: T.accent, backgroundColor: T.accentSoft },

  rowFields: { flexDirection: 'row', gap: 12 },

  /* Toggle */
  toggleRow:   { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12, marginTop: 4 },
  toggleLabel: { fontSize: 13.5, fontWeight: '600', color: T.ink },
  toggleSub:   { fontSize: 11.5, color: T.muted, marginTop: 3, lineHeight: 16 },

  /* Save button */
  saveBtn:     { marginTop: 8, backgroundColor: T.ink, borderRadius: 14, paddingVertical: 15, alignItems: 'center', justifyContent: 'center' },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  /* Danger zone */
  dangerZone:    { marginTop: 20, borderRadius: 16, padding: 16, backgroundColor: T.card, borderWidth: 1, borderColor: '#F0C2C0' },
  dangerTitle:   { fontSize: 13, fontWeight: '700', color: T.danger, marginBottom: 6 },
  dangerNote:    { fontSize: 12, color: T.muted, lineHeight: 17, marginBottom: 12 },
  dangerBtn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 12, backgroundColor: T.dangerSoft, borderWidth: 1, borderColor: '#F0C2C0' },
  dangerBtnText: { fontSize: 13, fontWeight: '700', color: T.danger },
});