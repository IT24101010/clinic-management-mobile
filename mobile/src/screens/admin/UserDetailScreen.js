import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
  Animated,
  Image,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../api/axiosConfig';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import ErrorAlert from '../../components/shared/ErrorAlert';
import SuccessAlert from '../../components/shared/SuccessAlert';
import { formatDate } from '../../utils/formatDate';

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

const ROLE_CONFIG = {
  patient: { fg: '#4F46E5', bg: '#EEF2FF', label: 'Patient', icon: 'person-outline' },
  doctor: { fg: T.success, bg: T.successSoft, label: 'Doctor', icon: 'medical-outline' },
  admin: { fg: '#D97706', bg: '#FEF3C7', label: 'Admin', icon: 'shield-outline' },
};

const RISK_CONFIG = {
  Low: { fg: T.success, bg: T.successSoft, icon: 'checkmark-circle-outline' },
  Medium: { fg: T.warn, bg: T.warnSoft, icon: 'alert-circle-outline' },
  High: { fg: T.danger, bg: T.dangerSoft, icon: 'warning-outline' },
};

const TONES = ['#CFE9DA', '#F9D9C3', '#E1D4F3', '#F6C9C7', '#D8E4F7', '#F5E2C4'];
const toneFor = (id = '') => {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return TONES[h % TONES.length];
};
const initialsOf = (name = '') =>
  name.trim().split(/\s+/).slice(0, 2).map(n => n[0]?.toUpperCase() || '').join('') || '?';

const getRoleConfig = (role) => ROLE_CONFIG[role] || ROLE_CONFIG.patient;
const getRiskConfig = (risk) => RISK_CONFIG[risk] || RISK_CONFIG.Low;

// ── Info Row ─────────────────────────────────────────────────────────────────
const InfoRow = ({ icon, label, value, last }) => (
  <View style={[styles.infoRow, last && styles.infoRowLast]}>
    <View style={styles.infoIcon}>
      <Ionicons name={icon} size={14} color={T.muted} />
    </View>
    <View style={{ flex: 1, minWidth: 0 }}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} numberOfLines={2}>{value || 'Not set'}</Text>
    </View>
  </View>
);

// ── Section Card ─────────────────────────────────────────────────────────────
const SectionCard = ({ title, children, style }) => (
  <View style={[styles.section, style]}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.sectionBody}>{children}</View>
  </View>
);

// ── Main Screen ──────────────────────────────────────────────────────────────
const UserDetailScreen = ({ navigation, route }) => {
  const { userId, user: initialUser } = route.params;

  const [user, setUser] = useState(initialUser || null);
  const [loading, setLoading] = useState(!initialUser);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showToggleDialog, setShowToggleDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const anim = useRef(new Animated.Value(initialUser ? 1 : 0)).current;

  const fetchUser = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const res = await api.get(`/api/users/${userId}`);
      setUser(res.data);
      Animated.timing(anim, { toValue: 1, duration: 450, useNativeDriver: true }).start();
    } catch {
      setError('Failed to load user details');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!initialUser) fetchUser();
    const unsub = navigation.addListener('focus', () => fetchUser());
    return unsub;
  }, [navigation, fetchUser]);

  const handleToggleActive = async () => {
    setShowToggleDialog(false);
    setActionLoading(true);
    setError('');
    try {
      await api.put(`/api/users/${userId}`, { isActive: !user.isActive });
      setUser(prev => ({ ...prev, isActive: !prev.isActive }));
      setSuccess(`Account ${!user.isActive ? 'activated' : 'deactivated'} successfully`);
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Failed to update account status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    setShowDeleteDialog(false);
    setActionLoading(true);
    setError('');
    try {
      await api.delete(`/api/users/${userId}`);
      navigation.goBack();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user');
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  if (!user) {
    return (
      <View style={styles.errorScreen}>
        <Ionicons name="alert-circle-outline" size={40} color={T.danger} />
        <Text style={styles.errorScreenText}>User not found</Text>
        <TouchableOpacity style={styles.backBtnAlt} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnAltText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const roleCfg = getRoleConfig(user.role);
  const riskCfg = getRiskConfig(user.riskLevel || 'Low');
  const isActive = user.isActive !== false;
  const initials = initialsOf(user.name);
  const memberSince = user.createdAt ? new Date(user.createdAt).getFullYear() : '—';
  const bgTone = toneFor(user._id || user.name || '');

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={T.bg} />

      {/* ── Top bar ── */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={20} color={T.ink} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>User profile</Text>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => navigation.navigate('EditUser', { user })}
          activeOpacity={0.7}
        >
          <Ionicons name="create-outline" size={18} color={T.accent} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchUser(true)}
            tintColor={T.accent}
          />
        }
      >
        <Animated.View
          style={{
            opacity: anim,
            transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
          }}
        >
          {/* ── Profile Card ── */}
          <View style={styles.profileCard}>
            <View style={styles.profileTop}>
              {user.profileImage ? (
                <Image source={{ uri: user.profileImage }} style={styles.profileAvatar} />
              ) : (
                <View style={[styles.profileAvatarFallback, { backgroundColor: bgTone }]}>
                  <Text style={styles.profileAvatarText}>{initials}</Text>
                </View>
              )}
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.profileName} numberOfLines={1}>{user.name || 'Unknown user'}</Text>
                <Text style={styles.profileEmail} numberOfLines={1}>{user.email}</Text>
                <View style={styles.profileBadges}>
                  <View style={[styles.badge, { backgroundColor: roleCfg.bg }]}>
                    <Ionicons name={roleCfg.icon} size={11} color={roleCfg.fg} />
                    <Text style={[styles.badgeText, { color: roleCfg.fg }]}>{roleCfg.label}</Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: isActive ? T.successSoft : T.dangerSoft }]}>
                    <View style={[styles.statusDot, { backgroundColor: isActive ? T.success : T.danger }]} />
                    <Text style={[styles.badgeText, { color: isActive ? '#0A6B55' : '#9C2A24' }]}>
                      {isActive ? 'Active' : 'Inactive'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Quick Stats inline */}
            <View style={styles.quickStats}>
              <View style={styles.quickStat}>
                <Text style={styles.quickStatLabel}>Member since</Text>
                <Text style={styles.quickStatValue}>{memberSince}</Text>
              </View>
              <View style={styles.quickStatSep} />
              {user.role === 'patient' ? (
                <View style={styles.quickStat}>
                  <Text style={styles.quickStatLabel}>Risk level</Text>
                  <Text style={[styles.quickStatValue, { color: riskCfg.fg }]}>
                    {user.riskLevel || 'Low'}
                  </Text>
                </View>
              ) : user.role === 'doctor' ? (
                <View style={styles.quickStat}>
                  <Text style={styles.quickStatLabel}>Experience</Text>
                  <Text style={styles.quickStatValue}>
                    {user.experience ? `${user.experience} yrs` : '—'}
                  </Text>
                </View>
              ) : (
                <View style={styles.quickStat}>
                  <Text style={styles.quickStatLabel}>Account</Text>
                  <Text style={styles.quickStatValue}>System</Text>
                </View>
              )}
              <View style={styles.quickStatSep} />
              <View style={styles.quickStat}>
                <Text style={styles.quickStatLabel}>Phone</Text>
                <Text style={styles.quickStatValue} numberOfLines={1}>
                  {user.phone || '—'}
                </Text>
              </View>
            </View>
          </View>

          {/* ── Alerts ── */}
          {error ? <View style={styles.alertWrap}><ErrorAlert message={error} /></View> : null}
          {success ? <View style={styles.alertWrap}><SuccessAlert message={success} /></View> : null}

          {/* ── Personal Info ── */}
          <SectionCard title="Personal information">
            <InfoRow icon="person-outline" label="Full name" value={user.name} />
            <InfoRow icon="mail-outline" label="Email" value={user.email} />
            <InfoRow icon="call-outline" label="Phone" value={user.phone} />
            <InfoRow
              icon="calendar-outline"
              label="Date of birth"
              value={user.dateOfBirth ? formatDate(user.dateOfBirth) : null}
            />
            <InfoRow
              icon="person-circle-outline"
              label="Gender"
              value={user.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : null}
            />
            <InfoRow icon="location-outline" label="Address" value={user.address} last />
          </SectionCard>

          {/* ── Medical (patients only) ── */}
          {user.role === 'patient' && (
            <SectionCard title="Medical & health">
              <InfoRow
                icon="document-text-outline"
                label="Medical history"
                value={`${user.medicalHistory?.length || 0} record${(user.medicalHistory?.length || 0) === 1 ? '' : 's'}`}
              />
              <InfoRow
                icon="alert-circle-outline"
                label="Allergies"
                value={user.allergies?.length ? user.allergies.join(', ') : 'None recorded'}
              />
              <InfoRow
                icon="analytics-outline"
                label="Blood reports"
                value={`${user.bloodReports?.length || 0} uploaded`}
              />
              <View style={styles.riskRow}>
                <View style={styles.infoIcon}>
                  <Ionicons name="fitness-outline" size={14} color={T.muted} />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.infoLabel}>Health risk level</Text>
                  <View style={[styles.badge, { backgroundColor: riskCfg.bg, marginTop: 4 }]}>
                    <Ionicons name={riskCfg.icon} size={11} color={riskCfg.fg} />
                    <Text style={[styles.badgeText, { color: riskCfg.fg }]}>
                      {user.riskLevel || 'Low'}
                    </Text>
                  </View>
                </View>
              </View>
            </SectionCard>
          )}

          {/* ── Emergency Contact (patients only) ── */}
          {user.role === 'patient' && (user.emergencyContact?.name || user.emergencyContact?.phone) && (
            <SectionCard title="Emergency contact">
              <InfoRow icon="people-outline" label="Name" value={user.emergencyContact?.name} />
              <InfoRow icon="call-outline" label="Phone" value={user.emergencyContact?.phone} last />
            </SectionCard>
          )}

          {/* ── Admin Actions ── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Admin actions</Text>
            <View style={styles.sectionBody}>
              <TouchableOpacity
                style={styles.actionRow}
                onPress={() => setShowToggleDialog(true)}
                disabled={actionLoading}
                activeOpacity={0.7}
              >
                <View style={[styles.actionIcon, { backgroundColor: isActive ? T.warnSoft : T.successSoft }]}>
                  <Ionicons
                    name={isActive ? 'pause-circle-outline' : 'play-circle-outline'}
                    size={16}
                    color={isActive ? T.warn : T.success}
                  />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.actionLabel}>
                    {isActive ? 'Deactivate account' : 'Activate account'}
                  </Text>
                  <Text style={styles.actionSub}>
                    {isActive ? 'Block this user from logging in' : 'Restore access for this user'}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={14} color={T.muted2} />
              </TouchableOpacity>

              <View style={styles.actionSep} />

              <TouchableOpacity
                style={styles.actionRow}
                onPress={() => setShowDeleteDialog(true)}
                disabled={actionLoading}
                activeOpacity={0.7}
              >
                <View style={[styles.actionIcon, { backgroundColor: T.dangerSoft }]}>
                  <Ionicons name="trash-outline" size={16} color={T.danger} />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={[styles.actionLabel, { color: T.danger }]}>Delete user account</Text>
                  <Text style={styles.actionSub}>Permanently remove all user data</Text>
                </View>
                <Ionicons name="chevron-forward" size={14} color={T.muted2} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ height: 32 }} />
        </Animated.View>
      </ScrollView>

      <ConfirmDialog
        visible={showToggleDialog}
        title={isActive ? 'Deactivate account' : 'Activate account'}
        message={`Are you sure you want to ${isActive ? 'deactivate' : 'activate'} ${user.name}'s account?`}
        onConfirm={handleToggleActive}
        onCancel={() => setShowToggleDialog(false)}
        confirmText={isActive ? 'Deactivate' : 'Activate'}
        confirmColor={isActive ? T.warn : T.success}
      />

      <ConfirmDialog
        visible={showDeleteDialog}
        title="Delete user"
        message={`Permanently delete ${user.name}'s account? All their data will be removed. This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
        confirmText="Delete"
        confirmColor={T.danger}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.bg },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 60 : 40,
  },

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
  topTitle: {
    flex: 1, textAlign: 'center',
    fontSize: 14, fontWeight: '600', color: T.ink, letterSpacing: -0.2,
  },

  // Profile card
  profileCard: {
    backgroundColor: T.card, borderRadius: 18,
    padding: 16, borderWidth: 1, borderColor: T.line,
    marginTop: 6, marginBottom: 14,
  },
  profileTop: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
  },
  profileAvatar: { width: 64, height: 64, borderRadius: 18 },
  profileAvatarFallback: {
    width: 64, height: 64, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  profileAvatarText: { fontSize: 22, fontWeight: '700', color: T.ink },
  profileName: { fontSize: 18, fontWeight: '700', color: T.ink, letterSpacing: -0.3 },
  profileEmail: { fontSize: 12, color: T.muted, marginTop: 2 },
  profileBadges: { flexDirection: 'row', gap: 6, marginTop: 8, flexWrap: 'wrap' },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  badgeText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.3 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },

  quickStats: {
    flexDirection: 'row', alignItems: 'stretch',
    marginTop: 14, paddingTop: 14,
    borderTopWidth: 1, borderTopColor: T.line,
  },
  quickStat: { flex: 1, alignItems: 'center' },
  quickStatLabel: {
    fontSize: 10, color: T.muted, fontWeight: '600',
    textTransform: 'uppercase', letterSpacing: 0.4,
  },
  quickStatValue: { fontSize: 13, fontWeight: '700', color: T.ink, marginTop: 4 },
  quickStatSep: { width: 1, backgroundColor: T.line, marginVertical: 4 },

  // Alerts
  alertWrap: { marginBottom: 12 },

  // Section
  section: { marginBottom: 14 },
  sectionTitle: {
    fontSize: 11, color: T.muted, fontWeight: '700',
    letterSpacing: 0.6, textTransform: 'uppercase',
    marginBottom: 10, paddingHorizontal: 2,
  },
  sectionBody: {
    backgroundColor: T.card, borderRadius: 16,
    borderWidth: 1, borderColor: T.line,
    paddingHorizontal: 14, paddingVertical: 4,
  },

  // Info row
  infoRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: T.line,
  },
  infoRowLast: { borderBottomWidth: 0 },
  infoIcon: {
    width: 30, height: 30, borderRadius: 9,
    backgroundColor: T.bg,
    alignItems: 'center', justifyContent: 'center',
  },
  infoLabel: {
    fontSize: 10, color: T.muted, fontWeight: '600',
    textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 3,
  },
  infoValue: { fontSize: 13, fontWeight: '600', color: T.ink },

  riskRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12,
  },

  // Action row
  actionRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12,
  },
  actionIcon: {
    width: 36, height: 36, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center',
  },
  actionLabel: { fontSize: 13, fontWeight: '700', color: T.ink },
  actionSub: { fontSize: 11, color: T.muted, marginTop: 2 },
  actionSep: { height: 1, backgroundColor: T.line },

  // Error screen
  errorScreen: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    gap: 12, backgroundColor: T.bg,
  },
  errorScreenText: { fontSize: 14, color: T.muted, fontWeight: '600' },
  backBtnAlt: {
    paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12,
    backgroundColor: T.accentSoft, marginTop: 6,
  },
  backBtnAltText: { fontSize: 13, fontWeight: '700', color: T.accent },
});

export default UserDetailScreen;
