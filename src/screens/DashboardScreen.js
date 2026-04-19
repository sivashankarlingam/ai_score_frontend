import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { theme } from '../theme';
import AnimatedButton from '../components/AnimatedButton';

export default function DashboardScreen({ route, navigation }) {
  const { user } = route.params;
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

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.headerBox, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <Text style={styles.welcomeText}>Welcome back,</Text>
        <Text style={styles.nameText}>{user.name}</Text>
      </Animated.View>

      <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <Text style={styles.cardTitle}>Ready to analyze an essay?</Text>
        <Text style={styles.cardDesc}>
          Use our AI model to score your essays. You can type it, paste it, or even upload a handwritten picture for OCR transcription.
        </Text>
        
        <AnimatedButton 
          style={styles.button}
          onPress={() => navigation.navigate('Predict')}
        >
          <Text style={styles.buttonText}>Start Prediction</Text>
        </AnimatedButton>
      </Animated.View>
      
      <Animated.View style={[styles.statsRow, { opacity: fadeAnim }]}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>Live</Text>
          <Text style={styles.statLabel}>Model Status</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>12k+</Text>
          <Text style={styles.statLabel}>Trained Set</Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
    padding: theme.layout.padding,
  },
  headerBox: {
    marginBottom: 30,
    marginTop: 20,
  },
  welcomeText: {
    fontSize: 18,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  nameText: {
    fontSize: 32,
    fontWeight: '800', // heavier weight for better typography
    color: theme.colors.primary,
  },
  card: {
    backgroundColor: theme.colors.surface,
    padding: 24,
    borderRadius: theme.layout.radius,
    ...theme.shadows.card,
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.navy,
    marginBottom: 10,
  },
  cardDesc: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    lineHeight: 24,
    marginBottom: 24,
  },
  button: {
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    backgroundColor: theme.colors.surface,
    width: '48%',
    padding: 20,
    borderRadius: theme.layout.radius,
    alignItems: 'center',
    ...theme.shadows.card,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.success,
  },
  statLabel: {
    fontSize: 14,
    color: theme.colors.textMuted,
    marginTop: 5,
    fontWeight: '500',
  }
});
