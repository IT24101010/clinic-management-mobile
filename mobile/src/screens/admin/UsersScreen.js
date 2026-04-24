import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Animated,
  StatusBar,
  Platform,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../api/axiosConfig';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

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
  danger: '#D6574F',
  dangerSoft: '#FADBD9',
};

const ROLE_CONFIG = {
  patient: { fg: '#4F46E5', bg: '#EEF2FF', label: 'Patient', icon: 'person-outline' },
  doctor: { fg: '#0F9D7A', bg: '#DDF3EA', label: 'Doctor', icon: 'medical-outline' },
  admin: { fg: '#D97706', bg: '#FEF3C7', label: 'Admin', icon: 'shield-outline' },
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

// ── User Card ────────────────────────────────────────────────────────────────
function UserCard({ item, index, onPress }) {
  const press = useRef(new Animated.Value(1)).current;
  const enter = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(enter, {
      toValue: 1, delay: (index % 8) * 50,
      useNativeDriver: true, speed: 50, bounciness: 4,
    }).start();
  }, []);

  const pressIn = () => Animated.spring(press, { toValue: 0.98, useNativeDriver: true, speed: 50, bounciness: 2 }).start();
  const pressOut = () => Animated.spring(press, { toValue: 1, useNativeDriver: true, speed: 50, bounciness: 2 }).start();

  const cfg = getRoleConfig(item.role);
  const initials = initialsOf(item.name);
  const bgTone = toneFor(item._id || item.name || '');
  const isActive = item.isActive !== false;

  return (
    <Animated.View style={{
      opacity: enter,
      transform: [
        { scale: press },
        { translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) },
      ],
    }}>
      <TouchableOpacity
        style={styles.card}
        activeOpacity={1}
        onPressIn={pressIn}
        onPressOut={pressOut}
        onPress={onPress}
      >
        <View style={styles.avatarWrap}>
          {item.profileImage ? (
            <Image source={{ uri: item.profileImage }} style={styles.avatarImg} />
          ) : (
            <View style={[styles.avatarFallback, { backgroundColor: bgTone }]}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          )}
          <View style={[styles.statusDot, { backgroundColor: isActive ? T.success : T.muted2 }]} />
        </View>

        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.userName} numberOfLines={1}>{item.name || 'Unknown'}</Text>
          <Text style={styles.userEmail} numberOfLines={1}>{item.email}</Text>
          <View style={styles.metaRow}>
            <View style={[styles.rolePill, { backgroundColor: cfg.bg }]}>
              <Ionicons name={cfg.icon} size={10} color={cfg.fg} />
              <Text style={[styles.rolePillText, { color: cfg.fg }]}>{cfg.label}</Text>
            </View>
            <View style={styles.metaSep} />
            <Text style={[styles.statusText, { color: isActive ? '#0A6B55' : T.muted }]} numberOfLines={1}>
              {isActive ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>

        <View style={styles.arrowBtn}>
          <Ionicons name="chevron-forward" size={14} color={T.muted} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ── Main Screen ──────────────────────────────────────────────────────────────
const UsersScreen = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  const anim = useRef(new Animated.Value(0)).current;

  const fetchUsers = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await api.get('/api/users', {
        params: { search, limit: 200 },
      });
      setUsers(res.data?.users || []);
      Animated.timing(anim, { toValue: 1, duration: 450, useNativeDriver: true }).start();
    } catch (err) {
      console.log('Error fetching users:', err);
    } finally {
      if (isRefresh) setRefreshing(false);
      else setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(() => fetchUsers(), 400);
    return () => clearTimeout(t);
  }, [search, fetchUsers]);

  useFocusEffect(useCallback(() => { fetchUsers(); }, []));

  const counts = useMemo(() => ({
    all: users.length,
    patient: users.filter(u => u.role === 'patient').length,
    doctor: users.filter(u => u.role === 'doctor').length,
    admin: users.filter(u => u.role === 'admin').length,
  }), [users]);

  const visibleUsers = useMemo(
    () => (filterRole ? users.filter(u => u.role === filterRole) : users),
    [users, filterRole],
  );

  const FILTERS = [
    { value: '', label: 'All', count: counts.all },
    { value: 'patient', label: 'Patients', count: counts.patient },
    { value: 'doctor', label: 'Doctors', count: counts.doctor },
    { value: 'admin', label: 'Admins', count: counts.admin },
  ];

  const Header = (
    <Animated.View
      style={{
        paddingHorizontal: 16,
        backgroundColor: T.bg,
        opacity: anim,
        transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
      }}
    >
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={20} color={T.ink} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.topLabel}>Administration</Text>
          <Text style={styles.topName}>Users</Text>
        </View>
      </View>

      {/* Title */}
      <View style={styles.titleRow}>
        <Text style={styles.pageTitle}>User management</Text>
        <Text style={styles.pageSub}>{counts.all} accounts · {counts.patient} patients</Text>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <StatPill label="Patients" value={counts.patient} fg="#4F46E5" bg="#EEF2FF" />
        <StatPill label="Doctors" value={counts.doctor} fg={T.success} bg={T.successSoft} />
        <StatPill label="Admins" value={counts.admin} fg="#D97706" bg="#FEF3C7" />
      </View>

      {/* Search */}
      <View style={[styles.searchWrap, searchFocused && styles.searchWrapFocused]}>
        <Ionicons name="search-outline" size={16} color={searchFocused ? T.accent : T.muted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or email"
          placeholderTextColor={T.muted2}
          value={search}
          onChangeText={setSearch}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          returnKeyType="search"
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close-circle" size={16} color={T.muted2} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Filters */}
      <View style={styles.filterRow}>
        {FILTERS.map(f => {
          const active = filterRole === f.value;
          return (
            <TouchableOpacity
              key={f.value}
              style={[styles.chip, active && styles.chipActive]}
              activeOpacity={0.8}
              onPress={() => setFilterRole(f.value)}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{f.label}</Text>
              <View style={[styles.chipBadge, active && styles.chipBadgeActive]}>
                <Text style={[styles.chipBadgeText, active && styles.chipBadgeTextActive]}>{f.count}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.sectionLabel}>
        {visibleUsers.length} {visibleUsers.length === 1 ? 'result' : 'results'}
      </Text>
    </Animated.View>
  );

  if (loading) return <LoadingSpinner />;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={T.bg} />
      {Header}
      <FlatList
        data={visibleUsers}
        keyExtractor={(item) => item._id}
        renderItem={({ item, index }) => (
          <UserCard
            item={item}
            index={index}
            onPress={() => navigation.navigate('UserDetail', { userId: item._id, user: item })}
          />
        )}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchUsers(true)}
            tintColor={T.accent}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <View style={styles.emptyIcon}>
              <Ionicons name="people-outline" size={28} color={T.muted2} />
            </View>
            <Text style={styles.emptyTitle}>No users found</Text>
            <Text style={styles.emptySubtitle}>
              {search ? `No results for "${search}"` : 'Try a different filter'}
            </Text>
          </View>
        }
      />
    </View>
  );
};

function StatPill({ label, value, fg, bg }) {
  return (
    <View style={styles.statPill}>
      <View style={[styles.statDot, { backgroundColor: bg }]}>
        <View style={[styles.statDotInner, { backgroundColor: fg }]} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel} numberOfLines={1}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.bg },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 140 : 120,
  },

  // Top bar
  topBar: {
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 10 : 52,
    paddingBottom: 6,
    flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: T.card, borderWidth: 1, borderColor: T.line,
    alignItems: 'center', justifyContent: 'center',
  },
  topLabel: { fontSize: 11, color: T.muted, fontWeight: '500' },
  topName: { fontSize: 14, fontWeight: '600', color: T.ink, letterSpacing: -0.2 },

  // Title
  titleRow: { paddingTop: 12, paddingBottom: 16 },
  pageTitle: { fontSize: 28, fontWeight: '700', color: T.ink, letterSpacing: -0.6 },
  pageSub: { fontSize: 13, color: T.muted, marginTop: 4 },

  // Stats
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  statPill: {
    flex: 1,
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 12, paddingHorizontal: 12,
    backgroundColor: T.card, borderRadius: 14,
    borderWidth: 1, borderColor: T.line,
  },
  statDot: {
    width: 28, height: 28, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center',
  },
  statDotInner: { width: 8, height: 8, borderRadius: 4 },
  statValue: { fontSize: 16, fontWeight: '700', color: T.ink, letterSpacing: -0.3 },
  statLabel: { fontSize: 11, color: T.muted, marginTop: 1 },

  // Search
  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: T.card,
    borderRadius: 14, paddingHorizontal: 14, height: 46,
    borderWidth: 1, borderColor: T.line,
    marginBottom: 10,
  },
  searchWrapFocused: { borderColor: T.accent, backgroundColor: T.card },
  searchInput: { flex: 1, fontSize: 14, color: T.ink, height: '100%', padding: 0 },

  // Filters
  filterRow: { flexDirection: 'row', gap: 6, marginBottom: 16 },
  chip: {
    flex: 1,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 8, paddingHorizontal: 8,
    borderRadius: 10, backgroundColor: T.card,
    borderWidth: 1, borderColor: T.line,
  },
  chipActive: { backgroundColor: T.ink, borderColor: T.ink },
  chipText: { fontSize: 12, fontWeight: '600', color: T.ink2 },
  chipTextActive: { color: '#fff' },
  chipBadge: {
    minWidth: 18, height: 18, borderRadius: 9,
    backgroundColor: T.bg,
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 5,
  },
  chipBadgeActive: { backgroundColor: 'rgba(255,255,255,0.18)' },
  chipBadgeText: { fontSize: 10, fontWeight: '700', color: T.muted },
  chipBadgeTextActive: { color: '#fff' },

  // Section label
  sectionLabel: {
    fontSize: 11, color: T.muted, fontWeight: '700',
    letterSpacing: 0.6, textTransform: 'uppercase',
    marginBottom: 10, paddingHorizontal: 2,
  },

  // Card
  card: {
    backgroundColor: T.card, borderRadius: 16,
    paddingVertical: 12, paddingHorizontal: 12,
    borderWidth: 1, borderColor: T.line,
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  avatarWrap: { position: 'relative' },
  avatarImg: { width: 48, height: 48, borderRadius: 14 },
  avatarFallback: {
    width: 48, height: 48, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 16, fontWeight: '700', color: T.ink },
  statusDot: {
    position: 'absolute', bottom: -2, right: -2,
    width: 12, height: 12, borderRadius: 6,
    borderWidth: 2, borderColor: T.card,
  },

  userName: { fontSize: 14, fontWeight: '700', color: T.ink, letterSpacing: -0.2 },
  userEmail: { fontSize: 12, color: T.muted, marginTop: 2 },

  metaRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginTop: 6,
  },
  rolePill: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 7, paddingVertical: 3,
    borderRadius: 7,
  },
  rolePillText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.3 },
  metaSep: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: T.muted2 },
  statusText: { fontSize: 11, fontWeight: '600' },

  arrowBtn: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: T.bg,
    alignItems: 'center', justifyContent: 'center',
  },

  // Empty
  emptyWrap: {
    alignItems: 'center', justifyContent: 'center',
    paddingTop: 60, gap: 8,
  },
  emptyIcon: {
    width: 64, height: 64, borderRadius: 20,
    backgroundColor: T.card, borderWidth: 1, borderColor: T.line,
    alignItems: 'center', justifyContent: 'center', marginBottom: 6,
  },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: T.ink },
  emptySubtitle: { fontSize: 12, color: T.muted, textAlign: 'center' },
});

export default UsersScreen;
