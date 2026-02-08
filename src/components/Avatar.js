import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SIZES } from '../constants/theme';

const Avatar = ({ text = 'JD', size = 36, onPress, style }) => {
  const Component = onPress ? TouchableOpacity : View;
  
  return (
    <Component
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size / 2 },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[styles.avatarText, { fontSize: size * 0.35 }]}>{text}</Text>
    </Component>
  );
};

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: COLORS.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: COLORS.orange,
    fontWeight: '600',
  },
});

export default Avatar;
