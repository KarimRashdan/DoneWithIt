import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';

export default function HomeScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Custom Image at the top */}
      <Image
        source={require('@/assets/images/muscle.png')}  // Replace this with your custom image
        style={styles.image}
        resizeMode="contain"
      />

      {/* Welcome Message */}
      <Text style={styles.welcomeText}>Welcome to your all-in-one weightlifting app!</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#1c1c1e',  // Background color (you can customize this)
  },
  image: {
    width: '100%',
    height: 250,  // Adjust height as needed
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 24,
    color: '#fff',
    textAlign: 'center',
  },
});