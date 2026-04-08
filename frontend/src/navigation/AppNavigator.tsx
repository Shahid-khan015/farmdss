import 'react-native-gesture-handler';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import type {
  AuthStackParamList,
  RootTabParamList,
  RootStackParamList,
  TractorStackParamList,
  ImplementStackParamList,
  SimulationStackParamList,
  IoTStackParamList,
} from './types';
import { colors } from '../constants/colors';
import { useAuth } from '../contexts/AuthContext';

import { DashboardRouter } from '../screens/DashboardRouter';
import { TractorListScreen } from '../screens/TractorListScreen';
import { TractorDetailScreen } from '../screens/TractorDetailScreen';
import { TractorFormScreen } from '../screens/TractorFormScreen';
import { ImplementListScreen } from '../screens/ImplementListScreen';
import { ImplementDetailScreen } from '../screens/ImplementDetailScreen';
import { ImplementFormScreen } from '../screens/ImplementFormScreen';
import { SimulationSetupScreen } from '../screens/SimulationSetupScreen';
import { SimulationResultScreen } from '../screens/SimulationResultScreen';
import { SimulationHistoryScreen } from '../screens/SimulationHistoryScreen';
import { SimulationCompareScreen } from '../screens/SimulationCompareScreen';
import { IoTDashboardScreen } from '../screens/IoTDashboardScreen';
import { IoTMapScreen } from '../screens/IoTMapScreen';
import { SessionHistoryScreen } from '../screens/SessionHistoryScreen';
import { SessionSetupScreen } from '../screens/SessionSetupScreen';
import { ActiveSessionScreen } from '../screens/ActiveSessionScreen';
import { SessionSummaryScreen } from '../screens/SessionSummaryScreen';
import { FieldMapScreen } from '../screens/FieldMapScreen';
import { ReportScreen } from '../screens/ReportScreen';
import { OperationChargesScreen } from '../screens/OperationChargesScreen';
import { ConfigurationScreen } from '../screens/ConfigurationScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const Tab = createBottomTabNavigator<RootTabParamList>();
const TractorStack = createNativeStackNavigator<TractorStackParamList>();
const ImplementStack = createNativeStackNavigator<ImplementStackParamList>();
const SimulationStack = createNativeStackNavigator<SimulationStackParamList>();
const IoTStack = createNativeStackNavigator<IoTStackParamList>();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

function IoTStackNavigator() {
  return (
    <IoTStack.Navigator screenOptions={{ headerShown: true }}>
      <IoTStack.Screen
        name="IoTDashboard"
        component={IoTDashboardScreen}
        options={{ title: 'IoT Dashboard' }}
      />
      <IoTStack.Screen name="IoTMap" component={IoTMapScreen} options={{ title: 'Map' }} />
    </IoTStack.Navigator>
  );
}

function TractorStackNavigator() {
  return (
    <TractorStack.Navigator>
      <TractorStack.Screen name="TractorList" component={TractorListScreen} options={{ title: 'Tractors' }} />
      <TractorStack.Screen name="TractorDetail" component={TractorDetailScreen} options={{ title: 'Tractor Details' }} />
      <TractorStack.Screen name="TractorForm" component={TractorFormScreen} options={{ title: 'Tractor' }} />
      <TractorStack.Screen name="SimulationSetup" component={SimulationSetupScreen} options={{ title: 'New Simulation' }} />
      <TractorStack.Screen name="SimulationResult" component={SimulationResultScreen} options={{ title: 'Simulation Result' }} />
    </TractorStack.Navigator>
  );
}

function ImplementStackNavigator() {
  return (
    <ImplementStack.Navigator>
      <ImplementStack.Screen name="ImplementList" component={ImplementListScreen} options={{ title: 'Implements' }} />
      <ImplementStack.Screen name="ImplementDetail" component={ImplementDetailScreen} options={{ title: 'Implement Details' }} />
      <ImplementStack.Screen name="ImplementForm" component={ImplementFormScreen} options={{ title: 'Implement' }} />
      <ImplementStack.Screen name="SimulationSetup" component={SimulationSetupScreen} options={{ title: 'New Simulation' }} />
      <ImplementStack.Screen name="SimulationResult" component={SimulationResultScreen} options={{ title: 'Simulation Result' }} />
    </ImplementStack.Navigator>
  );
}

function SimulationStackNavigator() {
  return (
    <SimulationStack.Navigator>
      <SimulationStack.Screen name="SimulationHistory" component={SimulationHistoryScreen} options={{ title: 'Simulations' }} />
      <SimulationStack.Screen name="SimulationSetup" component={SimulationSetupScreen} options={{ title: 'New Simulation' }} />
      <SimulationStack.Screen name="SimulationResult" component={SimulationResultScreen} options={{ title: 'Simulation Result' }} />
      <SimulationStack.Screen name="SimulationCompare" component={SimulationCompareScreen} options={{ title: 'Compare' }} />
    </SimulationStack.Navigator>
  );
}

function MainTabNavigator() {
  const { user } = useAuth();
  const useSidebarNav = user?.role === 'owner' || user?.role === 'researcher';
  const hideTractorImplementTabs = user?.role === 'operator' || user?.role === 'farmer';
  const hideSimulationTab = useSidebarNav || user?.role === 'operator' || user?.role === 'farmer';

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
      }}
    >
      <Tab.Screen
        name="Home"
        component={DashboardRouter}
        options={{
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="sprout" color={color} size={size} />,
        }}
      />
      {!useSidebarNav ? (
        <Tab.Screen
          name="IoTTab"
          component={IoTStackNavigator}
          options={{
            title: 'IoT',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="view-dashboard-variant" color={color} size={size} />
            ),
          }}
        />
      ) : null}
      <Tab.Screen
        name="Sessions"
        component={SessionHistoryScreen}
        options={{
          tabBarLabel: 'Sessions',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="clipboard-outline" color={color} size={size} />
          ),
        }}
      />
      {!hideTractorImplementTabs ? (
        <Tab.Screen
          name="TractorsTab"
          component={TractorStackNavigator}
          options={{
            title: 'Tractors',
            tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="tractor" color={color} size={size} />,
          }}
        />
      ) : null}
      {!hideTractorImplementTabs ? (
        <Tab.Screen
          name="ImplementsTab"
          component={ImplementStackNavigator}
          options={{
            title: 'Implements',
            tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="tools" color={color} size={size} />,
          }}
        />
      ) : null}
      {!hideSimulationTab ? (
        <Tab.Screen
          name="SimulationsTab"
          component={SimulationStackNavigator}
          options={{
            title: 'Simulations',
            tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="chart-line" color={color} size={size} />,
          }}
        />
      ) : null}
    </Tab.Navigator>
  );
}

function RootNavigator() {
  const { isReady, isAuthenticated } = useAuth();

  if (!isReady) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator size="large" color={colors.primary} accessibilityLabel="Loading" />
      </View>
    );
  }

  return (
    <RootStack.Navigator
      key={isAuthenticated ? 'main' : 'auth'}
      screenOptions={{ headerShown: false }}
    >
      {isAuthenticated ? (
        <>
          <RootStack.Screen name="Main" component={MainTabNavigator} />
          <RootStack.Screen
            name="Reports"
            component={ReportScreen}
            options={{ title: 'Reports', headerShown: true }}
          />
          <RootStack.Screen
            name="OperationCharges"
            component={OperationChargesScreen}
            options={{ title: 'Operation Charges', headerShown: true }}
          />
          <RootStack.Screen
            name="Configuration"
            component={ConfigurationScreen}
            options={{ title: 'Configuration', headerShown: true }}
          />
          <RootStack.Screen
            name="IoTStackScreen"
            component={IoTStackNavigator}
            options={{ headerShown: false }}
          />
          <RootStack.Screen
            name="SimulationStackScreen"
            component={SimulationStackNavigator}
            options={{ headerShown: false }}
          />
          <RootStack.Screen name="SessionSetup" component={SessionSetupScreen} />
          <RootStack.Screen name="ActiveSession" component={ActiveSessionScreen} />
          <RootStack.Screen name="SessionSummary" component={SessionSummaryScreen} />
          <RootStack.Screen name="FieldMap" component={FieldMapScreen} />
        </>
      ) : (
        <RootStack.Screen name="Auth" component={AuthNavigator} />
      )}
    </RootStack.Navigator>
  );
}

export function AppNavigator() {
  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
