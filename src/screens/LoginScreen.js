import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Animated, Image } from 'react-native';
import { theme } from '../theme';
import api from '../api';
import AnimatedButton from '../components/AnimatedButton';

export default function LoginScreen({ navigation }) {
  const [loginid, setLoginid] = useState('');
  const [password, setPassword] = useState('');
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

  const handleLogin = async () => {
    if (!loginid || !password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    // ── Admin short-circuit (no API needed) ──────────────────────────────
    if (loginid.trim().toLowerCase() === 'admin' && password === 'admin') {
      navigation.replace('Admin', {
        user: {
          name: 'Administrator',
          loginid: 'admin',
          email: 'admin@aesscore.com',
          city: 'Admin',
          is_admin: true,
        }
      });
      return;
    }
    // ─────────────────────────────────────────────────────────────────────

    setLoading(true);
    try {
      const response = await api.post('auth/login', { loginid, password });
      if (response.status === 200) {
        if (response.data.is_admin) {
          navigation.replace('Admin', { user: response.data });
        } else {
          navigation.replace('Main', { user: response.data });
        }
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Network error';
      Alert.alert('Login Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], alignItems: 'center' }]}>
        <Image 
          source={require('../../assets/icon.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>
          AES Score
        </Text>
        <Text style={styles.subtitle}>
          Sign in to your account
        </Text>
      </Animated.View>

      <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <TextInput
          style={styles.input}
          placeholder="Login ID"
          placeholderTextColor={theme.colors.textMuted}
          autoCapitalize="none"
          value={loginid}
          onChangeText={setLoginid}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={theme.colors.textMuted}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <AnimatedButton style={styles.button} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Login</Text>}
        </AnimatedButton>

        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.divider} />
        </View>

        <AnimatedButton 
          style={styles.registerButton} 
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.registerButtonText}>Register</Text>
        </AnimatedButton>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
    justifyContent: 'center',
    padding: theme.layout.padding,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 16,
    borderRadius: 16,
  },
  title: {
    fontSize: 40,
    fontWeight: '900',
    color: theme.colors.primary,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 40,
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
    marginBottom: 16,
    color: theme.colors.textPrimary,
    fontSize: 15,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  button: {
    width: '100%',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  dividerText: {
    marginHorizontal: 10,
    color: theme.colors.textMuted,
    fontWeight: '600',
    fontSize: 12,
  },
  registerButton: {
    width: '100%',
    backgroundColor: theme.colors.surface2,
    borderWidth: 1,
    borderColor: theme.colors.primaryHover,
  },
  registerButtonText: {
    color: theme.colors.primaryHover,
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
  }
});
