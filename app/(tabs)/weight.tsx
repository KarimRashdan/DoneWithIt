import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function WeightScreen() {
  return (
    <View style={styles.container}>
      <Text>This is the Weight Tracker screen!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
