import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  StatusBar,
  Animated,
  ActivityIndicator,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../api/axiosConfig';
import ErrorAlert from '../../components/shared/ErrorAlert';
import SuccessAlert from '../../components/shared/SuccessAlert';

// ── Design tokens ────────────────────────────────────────────────────────────
const T = {
  bg: '#F4F5F7',
  card: '#FFFFFF',
  line: '#E8EAEF',
  line2: '#E3E6EC',
  ink: '#0E1422',
  ink2: '#3A4254',
  muted: '#7A8296',
  muted2: '#A7ADBB',
  accent: '#0B5FFF',
  accentSoft: '#E7EFFF',
  success: '#0F9D7A',
  successSoft: '#DDF3EA',
  warn: '#E0A23B',
  warnSoft: '#FBEFD6',
  danger: '#D6574F',
  dangerSoft: '#FADBD9',
};

// ── Option chip ──────────────────────────────────────────────────────────────
const OptionChip = ({ label, icon, selected, onPress }) => (
  <TouchableOpacity
    style={[styles.optionChip, selected && styles.optionChipActive]}
    onPress={onPress}
    activeOpacity={0.8}
  >
    {icon ? (
      <Ionicons
        name={icon}
        size={13}
        color={selected ? '#fff' : T.ink2}
        style={{ marginRight: 5 }}
      />
    ) : null}
    <Text style={[styles.optionChipText, selected && styles.optionChipTextActive]}>{label}</Text>
  </TouchableOpacity>
);

// ── Edit Field ───────────────────────────────────────────────────────────────
const EditField = ({ label, icon, value, onChangeText, keyboardType, focusedField, fieldName, onFocus, onBlur, editable = true }) => {
  const isFocused = focusedField === fieldName;
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={[
        styles.inputRow,
        isFocused && styles.inputRowFocused,
        !editable && styles.inputRowDisabled,
      ]}>
        <Ionicons
          name={icon}
          size={15}
          color={isFocused ? T.accent : T.muted}
          style={styles.inputIcon}
        />
        <TextInput
          style={[styles.input, !editable && { color: T.muted }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={`Enter ${label.toLowerCase()}`}
          placeholderTextColor={T.muted2}
          keyboardType={keyboardType || 'default'}
          editable={editable}
          onFocus={() => onFocus && onFocus(fieldName)}
          onBlur={() => onBlur && onBlur()}
        />
        {!editable && (
          <Ionicons name="lock-closed-outline" size={13} color={T.muted2} />
        )}
      </View>
    </View>
  );
};

// ── Section ──────────────────────────────────────────────────────────────────
const Section = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.sectionBody}>{children}</View>
  </View>
);

// ── Main Screen ──────────────────────────────────────────────────────────────
const EditUserScreen = ({ navigation, route }) => {
  const { user: initialUser } = route.params;

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [focusedField, setFocusedField] = useState(null);

  const [form, setForm] = useState({
    name: initialUser.name || '',
    email: initialUser.email || '',
    phone: initialUser.phone || '',
    address: initialUser.address || '',
    role: initialUser.role || 'patient',
    gender: initialUser.gender || '',
    riskLevel: initialUser.riskLevel || 'Low',
    isActive: initialUser.isActive !== false,
  });

  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 450, useNativeDriver: true }).start();
  }, []);

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Full name is required'); return; }
    if (!form.email.trim()) { setError('Email is required'); return; }

    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await api.put(`/api/users/${initialUser._id}`, {
        name: form.name.trim(),
        phone: form.phone,
        address: form.address,
        role: form.role,
        gender: form.gender,
        riskLevel: form.riskLevel,
        isActive: form.isActive,
      });
      setSuccess('User updated successfully');
      setTimeout(() => navigation.goBack(), 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const ROLES = [
    { value: 'patient', label: 'Patient', icon: 'person-outline' },
    { value: 'doctor', label: 'Doctor', icon: 'medical-outline' },
    { value: 'admin', label: 'Admin', icon: 'shield-outline' },
  ];
  const GENDERS = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
  ];
  const RISKS = [
    { value: 'Low', label: 'Low' },
    { value: 'Medium', label: 'Medium' },
    { value: 'High', label: 'High' },
  ];

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor={T.bg} />

      {/* ── Top bar ── */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={20} color={T.ink} />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={styles.topTitle}>Edit user</Text>
          <Text style={styles.topSub} numberOfLines={1}>{initialUser.name}</Text>
        </View>
        <TouchableOpacity
          style={[styles.saveBtnSmall, saving && { opacity: 0.5 }]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.8}
        >
          {saving
            ? <ActivityIndicator size="small" color="#fff" />
            : <Ionicons name="checkmark" size={18} color="#fff" />}
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View
          style={{
            opacity: anim,
            transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
          }}
        >
          {error ? <View style={{ marginBottom: 12 }}><ErrorAlert message={error} /></View> : null}
          {success ? <View style={{ marginBottom: 12 }}><SuccessAlert message={success} /></View> : null}

          {/* ── Personal Info ── */}
          <Section title="Personal information">
            <EditField
              label="Full name" icon="person-outline"
              value={form.name} onChangeText={v => set('name', v)}
              focusedField={focusedField} fieldName="name"
              onFocus={setFocusedField} onBlur={() => setFocusedField(null)}
            />
            <EditField
              label="Email" icon="mail-outline"
              value={form.email} editable={false}
              focusedField={focusedField} fieldName="email"
            />
            <EditField
              label="Phone" icon="call-outline"
              value={form.phone} onChangeText={v => set('phone', v)}
              keyboardType="phone-pad"
              focusedField={focusedField} fieldName="phone"
              onFocus={setFocusedField} onBlur={() => setFocusedField(null)}
            />
            <EditField
              label="Address" icon="location-outline"
              value={form.address} onChangeText={v => set('address', v)}
              focusedField={focusedField} fieldName="address"
              onFocus={setFocusedField} onBlur={() => setFocusedField(null)}
            />

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Gender</Text>
              <View style={styles.chipRow}>
                {GENDERS.map(g => (
                  <OptionChip
                    key={g.value}
                    label={g.label}
                    selected={form.gender === g.value}
                    onPress={() => set('gender', g.value)}
                  />
                ))}
              </View>
            </View>
          </Section>

          {/* ── Account ── */}
          <Section title="Account settings">
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Role</Text>
              <View style={styles.chipRow}>
                {ROLES.map(r => (
                  <OptionChip
                    key={r.value}
                    label={r.label}
                    icon={r.icon}
                    selected={form.role === r.value}
                    onPress={() => set('role', r.value)}
                  />
                ))}
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Account status</Text>
              <View style={styles.chipRow}>
                <OptionChip
                  label="Active"
                  icon="checkmark-circle-outline"
                  selected={form.isActive}
                  onPress={() => set('isActive', true)}
                />
                <OptionChip
                  label="Inactive"
                  icon="close-circle-outline"
                  selected={!form.isActive}
                  onPress={() => set('isActive', false)}
                />
              </View>
            </View>
          </Section>

          {/* ── Health (patients) ── */}
          {form.role === 'patient' && (
            <Section title="Health settings">
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Risk level</Text>
                <View style={styles.chipRow}>
                  {RISKS.map(r => (
                    <OptionChip
                      key={r.value}
                      label={r.label}
                      selected={form.riskLevel === r.value}
                      onPress={() => set('riskLevel', r.value)}
                    />
                  ))}
                </View>
                <Text style={styles.fieldHint}>
                  High-risk patients automatically receive priority flags on appointments.
                </Text>
              </View>
            </Section>
          )}

          {/* ── Save ── */}
          <TouchableOpacity
            style={[styles.saveBtn, saving && { opacity: 0.7 }]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.85}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.saveBtnText}>Save changes</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={{ height: 32 }} />
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.bg },

  // Top bar
  topBar: {
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 10 : 52,
    paddingBottom: 10,
    paddingHorizontal: 16,
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: T.bg,
  },
  iconBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: T.card, borderWidth: 1, borderColor: T.line,
    alignItems: 'center', justifyContent: 'center',
  },
  topTitle: { fontSize: 14, fontWeight: '700', color: T.ink, letterSpacing: -0.2 },
  topSub: { fontSize: 11, color: T.muted, marginTop: 2, fontWeight: '500' },
  saveBtnSmall: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: T.ink,
    alignItems: 'center', justifyContent: 'center',
  },

  // Scroll
  scrollContent: { paddingHorizontal: 16, paddingTop: 6 },

  // Section
  section: { marginBottom: 14 },
  sectionTitle: {
    fontSize: 11, color: T.muted, fontWeight: '700',
    letterSpacing: 0.6, textTransform: 'uppercase',
    marginBottom: 10, paddingHorizontal: 2,
  },
  sectionBody: {
    backgroundColor: T.card, borderRadius: 16,
    padding: 14, gap: 12,
    borderWidth: 1, borderColor: T.line,
  },

  // Field
  fieldGroup: {},
  fieldLabel: {
    fontSize: 11, fontWeight: '700', color: T.ink2,
    marginBottom: 6, marginLeft: 2, letterSpacing: -0.1,
  },
  fieldHint: {
    fontSize: 11, color: T.muted, fontWeight: '500',
    marginTop: 8, lineHeight: 15,
  },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    height: 46, backgroundColor: T.bg,
    borderRadius: 12, paddingHorizontal: 12,
    borderWidth: 1, borderColor: 'transparent',
  },
  inputRowFocused: { borderColor: T.accent, backgroundColor: T.card },
  inputRowDisabled: { opacity: 0.65 },
  inputIcon: {},
  input: { flex: 1, fontSize: 14, color: T.ink, height: '100%', padding: 0 },

  // Chips
  chipRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  optionChip: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 10, backgroundColor: T.bg,
    borderWidth: 1, borderColor: T.line,
  },
  optionChipActive: { backgroundColor: T.ink, borderColor: T.ink },
  optionChipText: { fontSize: 12, fontWeight: '600', color: T.ink2 },
  optionChipTextActive: { color: '#fff' },

  // Save button
  saveBtn: {
    flexDirection: 'row',
    height: 50, borderRadius: 14,
    backgroundColor: T.ink,
    justifyContent: 'center', alignItems: 'center',
    marginTop: 4,
  },
  saveBtnText: { fontSize: 14, fontWeight: '700', color: '#fff', letterSpacing: -0.1 },
});

export default EditUserScreen;
