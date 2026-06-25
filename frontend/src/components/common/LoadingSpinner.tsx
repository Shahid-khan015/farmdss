import React from 'react';
import { View } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { colors } from '../../constants/colors';

export function LoadingSpinner() {
  return (
    <View style={{ padding: 16, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator animating color={colors.primary} />
    </View>
  );
}

