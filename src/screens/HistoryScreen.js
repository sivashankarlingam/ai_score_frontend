import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Animated } from 'react-native';
import { theme } from '../theme';
import api from '../api';

export default function HistoryScreen({ route }) {
  const { user } = route.params;
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await api.get(`history/${user.loginid}`);
      setHistory(response.data);
    } catch (error) {
      console.log('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item, index }) => {
    return <HistoryItem item={item} index={index} />;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Score History</Text>
      
      {loading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} style={{marginTop: 50}} />
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>You haven't scored any essays yet.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const HistoryItem = ({ item, index }) => {
  const slideAnim = useRef(new Animated.Value(50)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 100, // staggered animation
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      })
    ]).start();
  }, [fadeAnim, slideAnim, index]);

  return (
    <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <View style={styles.scoreBox}>
        <Text style={styles.scoreNumber}>{item.score}</Text>
        <Text style={styles.scoreLabel}>Pts</Text>
      </View>
      <View style={styles.infoBox}>
        <Text style={styles.snippet} numberOfLines={3} ellipsizeMode="tail">
          {item.essay_snippet}
        </Text>
        <Text style={styles.date}>
          {new Date(item.scored_at).toLocaleString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
    padding: theme.layout.padding,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.colors.navy,
    marginBottom: 24,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.layout.radius,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    ...theme.shadows.card,
  },
  scoreBox: {
    backgroundColor: theme.colors.blue100,
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: 65,
    height: 65,
    marginRight: 16,
  },
  scoreNumber: {
    fontSize: 24,
    fontWeight: '900',
    color: theme.colors.primary,
  },
  scoreLabel: {
    fontSize: 11,
    color: theme.colors.primary,
    textTransform: 'uppercase',
    fontWeight: '700',
    marginTop: -2,
  },
  infoBox: {
    flex: 1,
    justifyContent: 'center',
  },
  snippet: {
    fontSize: 14,
    color: theme.colors.textPrimary,
    lineHeight: 20,
    marginBottom: 8,
  },
  date: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontWeight: '500',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: theme.colors.textMuted,
    fontSize: 16,
    fontWeight: '500',
  }
});
