import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { theme } from '../theme';
import AnimatedButton from './AnimatedButton';

export default function ThemedModal({ 
  visible, 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  confirmText = "Confirm", 
  cancelText = "Cancel",
  confirmColor = theme.colors.primary,
  isDestructive = false
}) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          
          <View style={styles.buttonRow}>
            <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
              <Text style={styles.cancelText}>{cancelText}</Text>
            </TouchableOpacity>
            
            <AnimatedButton 
              onPress={onConfirm} 
              style={[
                styles.confirmButton, 
                { backgroundColor: isDestructive ? theme.colors.danger : confirmColor }
              ]}
            >
              <Text style={styles.confirmText}>{confirmText}</Text>
            </AnimatedButton>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalContainer: {
    width: '100%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.layout.radius,
    padding: 24,
    ...theme.shadows.card
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.navy,
    marginBottom: 12
  },
  message: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    lineHeight: 22,
    marginBottom: 24
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  cancelButton: {
    marginRight: 20,
    paddingVertical: 10,
    paddingHorizontal: 15
  },
  cancelText: {
    color: theme.colors.textMuted,
    fontWeight: '600',
    fontSize: 16
  },
  confirmButton: {
    paddingHorizontal: 25,
    minWidth: 100,
    borderRadius: 12,
    elevation: 0,
    shadowOpacity: 0
  },
  confirmText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  }
});
