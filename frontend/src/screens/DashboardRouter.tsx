import React from 'react';

import { useAuth } from '../contexts/AuthContext';
import { HomeScreen } from './HomeScreen';
import { OperatorDashboardScreen } from './dashboards/OperatorDashboardScreen';
import { FarmerDashboardScreen } from './dashboards/FarmerDashboardScreen';

export function DashboardRouter() {
  const { user } = useAuth();
  const role = user?.role;

  if (role === 'owner') return <HomeScreen />;
  if (role === 'operator') return <OperatorDashboardScreen />;
  if (role === 'farmer') return <FarmerDashboardScreen />;
  return <HomeScreen />;
}
