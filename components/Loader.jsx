import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';

export default function Loader({ text, size = 'large', color = '#C62828' }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={color} />
      {text && (
        <Text style={styles.text}>{text}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    marginTop: 16,
    color: '#666',
  },
});
