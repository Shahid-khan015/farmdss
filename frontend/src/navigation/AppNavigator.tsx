import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import type { RootTabParamList, TractorStackParamList, ImplementStackParamList, SimulationStackParamList } from './types';
import { colors } from '../constants/colors';

import { HomeScreen } from '../screens/HomeScreen';
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

const Tab = createBottomTabNavigator<RootTabParamList>();
const TractorStack = createNativeStackNavigator<TractorStackParamList>();
const ImplementStack = createNativeStackNavigator<ImplementStackParamList>();
const SimulationStack = createNativeStackNavigator<SimulationStackParamList>();

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

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="sprout" color={color} size={size} />,
          }}
        />
        <Tab.Screen
          name="TractorsTab"
          component={TractorStackNavigator}
          options={{
            title: 'Tractors',
            tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="tractor" color={color} size={size} />,
          }}
        />
        <Tab.Screen
          name="ImplementsTab"
          component={ImplementStackNavigator}
          options={{
            title: 'Implements',
            tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="tools" color={color} size={size} />,
          }}
        />
        <Tab.Screen
          name="SimulationsTab"
          component={SimulationStackNavigator}
          options={{
            title: 'Simulations',
            tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="chart-line" color={color} size={size} />,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

