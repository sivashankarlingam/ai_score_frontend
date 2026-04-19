import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator,
  Animated, TouchableOpacity, TextInput, ScrollView, Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import api from '../api';
import ThemedModal from '../components/ThemedModal';
import AnimatedButton from '../components/AnimatedButton';

const STATUS_COLORS = {
  activated: { bg: '#D1FAE5', text: '#059669' },
  waiting:   { bg: '#FEF3C7', text: '#D97706' },
  blocked:   { bg: '#FEE2E2', text: '#DC2626' },
};

export default function AdminDashboardScreen() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Delete modal
  const [deleteModal, setDeleteModal] = useState({ visible: false, user: null });

  // Edit modal
  const [editModal, setEditModal] = useState({ visible: false, user: null });
  const [editForm, setEditForm] = useState({});
  const [savingEdit, setSavingEdit] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('admin/users');
      setUsers(response.data);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    } catch (error) {
      console.log('Error fetching users:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  const handleActivate = async (user) => {
    try {
      await api.put(`admin/users/${user.id}/activate`);
      setUsers(prev =>
        prev.map(u => u.id === user.id ? { ...u, status: 'activated' } : u)
      );
    } catch (e) {
      console.log('Activate error:', e);
    }
  };

  const openEditModal = (user) => {
    setEditForm({
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      locality: user.locality,
      address: user.address,
      city: user.city,
      state: user.state,
    });
    setEditModal({ visible: true, user });
  };

  const handleSaveEdit = async () => {
    setSavingEdit(true);
    try {
      await api.put(`admin/users/${editModal.user.id}`, editForm);
      setUsers(prev =>
        prev.map(u => u.id === editModal.user.id ? { ...u, ...editForm } : u)
      );
      setEditModal({ visible: false, user: null });
    } catch (e) {
      console.log('Edit error:', e);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async () => {
    const uid = deleteModal.user?.id;
    setDeleteModal({ visible: false, user: null });
    try {
      await api.delete(`admin/users/${uid}`);
      setUsers(prev => prev.filter(u => u.id !== uid));
    } catch (e) {
      console.log('Delete error:', e);
    }
  };

  const renderUser = ({ item, index }) => (
    <UserCard
      item={item}
      index={index}
      onActivate={() => handleActivate(item)}
      onEdit={() => openEditModal(item)}
      onDelete={() => setDeleteModal({ visible: true, user: item })}
    />
  );

  const stats = {
    total: users.length,
    activated: users.filter(u => u.status === 'activated').length,
    waiting: users.filter(u => u.status === 'waiting').length,
  };

  return (
    <View style={styles.container}>
      {/* Stats Row */}
      <Animated.View style={[styles.statsRow, { opacity: fadeAnim }]}>
        <View style={[styles.statBox, { backgroundColor: '#DBEAFE' }]}>
          <Text style={[styles.statValue, { color: theme.colors.primary }]}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: '#D1FAE5' }]}>
          <Text style={[styles.statValue, { color: '#059669' }]}>{stats.activated}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: '#FEF3C7' }]}>
          <Text style={[styles.statValue, { color: '#D97706' }]}>{stats.waiting}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
      </Animated.View>

      {loading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={users}
          keyExtractor={item => item.id.toString()}
          renderItem={renderUser}
          contentContainerStyle={{ paddingBottom: 30 }}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={48} color={theme.colors.textMuted} />
              <Text style={styles.emptyText}>No users registered yet</Text>
            </View>
          }
        />
      )}

      {/* Delete Confirmation Modal */}
      <ThemedModal
        visible={deleteModal.visible}
        title="Delete User"
        message={`Are you sure you want to permanently delete "${deleteModal.user?.name}"? This cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal({ visible: false, user: null })}
        isDestructive={true}
      />

      {/* Edit Modal */}
      <Modal
        visible={editModal.visible}
        animationType="slide"
        transparent
        onRequestClose={() => setEditModal({ visible: false, user: null })}
      >
        <View style={styles.editOverlay}>
          <View style={styles.editContainer}>
            <View style={styles.editHeader}>
              <Text style={styles.editTitle}>Edit User</Text>
              <TouchableOpacity onPress={() => setEditModal({ visible: false, user: null })}>
                <Ionicons name="close" size={24} color={theme.colors.navy} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {['name', 'email', 'mobile', 'locality', 'address', 'city', 'state'].map(field => (
                <View key={field} style={styles.editFieldWrapper}>
                  <Text style={styles.editFieldLabel}>{field.charAt(0).toUpperCase() + field.slice(1)}</Text>
                  <TextInput
                    style={styles.editInput}
                    value={editForm[field] || ''}
                    onChangeText={val => setEditForm(prev => ({ ...prev, [field]: val }))}
                    placeholderTextColor={theme.colors.textMuted}
                  />
                </View>
              ))}
            </ScrollView>
            <AnimatedButton style={styles.saveButton} onPress={handleSaveEdit} disabled={savingEdit}>
              {savingEdit
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.saveButtonText}>Save Changes</Text>}
            </AnimatedButton>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// --- Sub-component for cleaner staggered animation ---
function UserCard({ item, index, onActivate, onEdit, onDelete }) {
  const slideAnim = useRef(new Animated.Value(40)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1, duration: 350, delay: index * 80, useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0, duration: 350, delay: index * 80, useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, index]);

  const sc = STATUS_COLORS[item.status] || STATUS_COLORS.waiting;

  return (
    <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      {/* Top row */}
      <View style={styles.cardHeader}>
        <View style={styles.avatarBox}>
          <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.userName}>{item.name}</Text>
          <Text style={styles.userSub}>{item.email}</Text>
          <Text style={styles.userId}>ID: {item.loginid}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
          <Text style={[styles.statusText, { color: sc.text }]}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>

      {/* Location info */}
      <View style={styles.locationRow}>
        <Ionicons name="location-outline" size={14} color={theme.colors.textMuted} />
        <Text style={styles.locationText}>{item.city}, {item.state}</Text>
      </View>

      {/* Action buttons */}
      <View style={styles.actionRow}>
        {item.status !== 'activated' && (
          <TouchableOpacity style={[styles.actionBtn, styles.activateBtn]} onPress={onActivate}>
            <Ionicons name="checkmark-circle-outline" size={16} color="#059669" />
            <Text style={[styles.actionBtnText, { color: '#059669' }]}>Activate</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={[styles.actionBtn, styles.editBtn]} onPress={onEdit}>
          <Ionicons name="create-outline" size={16} color={theme.colors.primary} />
          <Text style={[styles.actionBtnText, { color: theme.colors.primary }]}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={onDelete}>
          <Ionicons name="trash-outline" size={16} color={theme.colors.danger} />
          <Text style={[styles.actionBtnText, { color: theme.colors.danger }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
    padding: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 26,
    fontWeight: '900',
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontWeight: '600',
    marginTop: 2,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.layout.radius,
    padding: 16,
    marginBottom: 14,
    ...theme.shadows.card,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarBox: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: theme.colors.blue100,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  cardInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.navy,
  },
  userSub: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  userId: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  locationText: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginLeft: 4,
  },
  actionRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: 12,
    gap: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 4,
  },
  activateBtn: { backgroundColor: '#D1FAE5' },
  editBtn:     { backgroundColor: theme.colors.blue100 },
  deleteBtn:   { backgroundColor: '#FEE2E2' },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: theme.colors.textMuted,
    fontWeight: '500',
  },
  // Edit Modal
  editOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  editContainer: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '85%',
  },
  editHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  editTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.navy,
  },
  editFieldWrapper: {
    marginBottom: 14,
  },
  editFieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textMuted,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  editInput: {
    backgroundColor: theme.colors.surface2,
    padding: 14,
    borderRadius: 12,
    color: theme.colors.textPrimary,
    fontSize: 15,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  saveButton: {
    width: '100%',
    marginTop: 16,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
