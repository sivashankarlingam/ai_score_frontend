import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

// Components
import ThemedModal from './src/components/ThemedModal';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import PredictScreen from './src/screens/PredictScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import AdminDashboardScreen from './src/screens/AdminDashboardScreen';
import { theme } from './src/theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Separate navigator instance for Admin — must NOT reuse the root Stack
const AdminNavStack = createNativeStackNavigator();

// Admin Stack for admin users
function AdminStack({ route, navigation }) {
  const { user } = route.params;
  const [logoutVisible, setLogoutVisible] = useState(false);

  const confirmLogout = () => {
    setLogoutVisible(false);
    navigation.replace('Login');
  };

  return (
    <View style={{ flex: 1 }}>
      <AdminNavStack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.primary, elevation: 0, shadowOpacity: 0 },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold', fontSize: 18 },
          headerRight: () => (
            <TouchableOpacity onPress={() => setLogoutVisible(true)} style={styles.logoutButton}>
              <Ionicons name="log-out-outline" size={24} color="#fff" />
            </TouchableOpacity>
          ),
        }}
      >
        <AdminNavStack.Screen
          name="AdminHome"
          component={AdminDashboardScreen}
          options={{ title: 'User Management' }}
        />
      </AdminNavStack.Navigator>

      <ThemedModal
        visible={logoutVisible}
        title="Logout"
        message="Are you sure you want to logout from the admin panel?"
        confirmText="Logout"
        cancelText="Cancel"
        onConfirm={confirmLogout}
        onCancel={() => setLogoutVisible(false)}
        isDestructive={true}
      />
    </View>
  );
}

// Bottom Tabs for authenticated users
function MainTabs({ route, navigation }) {
  const { user } = route.params;
  const [logoutVisible, setLogoutVisible] = useState(false);

  const handleLogout = () => {
    setLogoutVisible(true);
  };

  const confirmLogout = () => {
    setLogoutVisible(false);
    navigation.replace('Login');
  };

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerStyle: { backgroundColor: theme.colors.primary, shadowColor: 'transparent', elevation: 0 },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.textMuted,
          tabBarStyle: {
            height: 65,
            paddingBottom: 10,
            paddingTop: 10,
            backgroundColor: theme.colors.surface,
            borderTopWidth: 1,
            borderTopColor: theme.colors.border,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === 'Dashboard') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Predict') {
              iconName = focused ? 'analytics' : 'analytics-outline';
            } else if (route.name === 'History') {
              iconName = focused ? 'time' : 'time-outline';
            }
            return <Ionicons name={iconName} size={size + 2} color={color} />;
          },
          headerRight: () => (
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
              <Ionicons name="log-out-outline" size={24} color="#fff" />
            </TouchableOpacity>
          ),
        })}
      >
        <Tab.Screen 
          name="Dashboard" 
          component={DashboardScreen} 
          initialParams={{ user }}
          options={{ title: 'Dashboard' }}
        />
        <Tab.Screen 
          name="Predict" 
          component={PredictScreen} 
          initialParams={{ user }}
          options={{ title: 'Predict Score' }}
        />
        <Tab.Screen 
          name="History" 
          component={HistoryScreen} 
          initialParams={{ user }}
          options={{ title: 'Score History' }}
        />
      </Tab.Navigator>

      <ThemedModal
        visible={logoutVisible}
        title="Logout"
        message="Are you sure you want to logout from your account?"
        confirmText="Logout"
        cancelText="Cancel"
        onConfirm={confirmLogout}
        onCancel={() => setLogoutVisible(false)}
        isDestructive={true}
      />
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: theme.colors.bg }
          }}
        >
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="Admin" component={AdminStack} />
        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  logoutButton: {
    marginRight: 15,
    padding: 5,
  }
});
