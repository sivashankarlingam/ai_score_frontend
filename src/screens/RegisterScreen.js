import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView, Animated } from 'react-native';
import { theme } from '../theme';
import api from '../api';
import AnimatedButton from '../components/AnimatedButton';

export default function RegisterScreen({ navigation }) {
  const [formData, setFormData] = useState({
    name: '', loginid: '', password: '', mobile: '',
    email: '', locality: '', address: '', city: '', state: ''
  });
  const [loading, setLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      })
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleRegister = async () => {
    setLoading(true);
    try {
      const response = await api.post('auth/register', formData);
      if (response.status === 200) {
        Alert.alert('Success', response.data.message);
        navigation.navigate('Login');
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Registration Failed';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Animated.Text style={[styles.title, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        Create Account
      </Animated.Text>
      <Animated.Text style={[styles.subtitle, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        Join to start analyzing essays
      </Animated.Text>
      
      <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        {['name', 'loginid', 'password', 'mobile', 'email', 'locality', 'address', 'city', 'state'].map(field => (
          <TextInput
            key={field}
            style={styles.input}
            placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
            placeholderTextColor={theme.colors.textMuted}
            secureTextEntry={field === 'password'}
            value={formData[field]}
            onChangeText={(val) => handleChange(field, val)}
          />
        ))}

        <AnimatedButton style={styles.button} onPress={handleRegister} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Register</Text>}
        </AnimatedButton>

        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.linkContainer}>
          <Text style={styles.linkText}>Already have an account? Login</Text>
        </TouchableOpacity>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: theme.colors.bg,
    justifyContent: 'center',
    padding: theme.layout.padding,
    paddingVertical: 50,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: theme.colors.primary,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    fontWeight: '500',
  },
  card: {
    backgroundColor: theme.colors.surface,
    padding: 24,
    borderRadius: theme.layout.radius,
    ...theme.shadows.card,
  },
  input: {
    backgroundColor: theme.colors.surface2,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    color: theme.colors.textPrimary,
    fontSize: 15,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  button: {
    width: '100%',
    marginTop: 12,
  },
  buttonText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 16,
    letterSpacing: 0.5,
  },
  linkContainer: {
    marginTop: 20,
    paddingVertical: 10,
  },
  linkText: { 
    color: theme.colors.primary, 
    textAlign: 'center', 
    fontWeight: '600',
    fontSize: 15,
  }
});
