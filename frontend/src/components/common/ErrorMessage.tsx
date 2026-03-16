import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { colors } from '../../constants/colors';

export function ErrorMessage({ message }: { message: string }) {
  return (
    <View style={{ padding: 16 }}>
      <Text style={{ color: colors.danger }}>{message}</Text>
    </View>
  );
}

