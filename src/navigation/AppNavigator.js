import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import CategoryScreen from '../screens/CategoryScreen';
import ServiceListScreen from '../screens/ServiceListScreen';
import ServiceDetailScreen from '../screens/ServiceDetailScreen';
import MyBookingsScreen from '../screens/MyBookingsScreen';
import BookingHistoryScreen from '../screens/BookingHistoryScreen';
import ProviderScreen from '../screens/ProviderScreen';
import ProviderDashboardScreen from '../screens/ProviderDashboardScreen';
import SubscriptionScreen from '../screens/SubscriptionScreen';
import SupportCenterScreen from '../screens/SupportCenterScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const HomeStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="Home" component={HomeScreen} />
    <Stack.Screen name="Categories" component={CategoryScreen} />
    <Stack.Screen name="Services" component={ServiceListScreen} />
    <Stack.Screen name="ServiceDetail" component={ServiceDetailScreen} />
    <Stack.Screen name="Provider" component={ProviderScreen} />
  </Stack.Navigator>
);

const BookingsStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="MyBookings" component={MyBookingsScreen} />
    <Stack.Screen name="BookingHistory" component={BookingHistoryScreen} />
  </Stack.Navigator>
);

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;

        switch (route.name) {
          case 'HomeTab':
            iconName = focused ? 'home' : 'home-outline';
            break;
          case 'BookingsTab':
            iconName = focused ? 'calendar' : 'calendar-outline';
            break;
          case 'Subscriptions':
            iconName = focused ? 'card' : 'card-outline';
            break;
          case 'Support':
            iconName = focused ? 'help-circle' : 'help-circle-outline';
            break;
        }

        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#2ecc71',
      tabBarInactiveTintColor: 'gray',
    })}
  >
    <Tab.Screen 
      name="HomeTab" 
      component={HomeStack} 
      options={{ headerShown: false, title: 'Home' }}
    />
    <Tab.Screen 
      name="BookingsTab" 
      component={BookingsStack} 
      options={{ headerShown: false, title: 'Bookings' }}
    />
    <Tab.Screen name="Subscriptions" component={SubscriptionScreen} />
    <Tab.Screen name="Support" component={SupportCenterScreen} />
  </Tab.Navigator>
);

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Signup" component={SignupScreen} />
  </Stack.Navigator>
);

const AppNavigator = () => {
  // Temporarily set isAuthenticated to true to bypass login
  const [isAuthenticated, setIsAuthenticated] = React.useState(true);

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default AppNavigator;