import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, KeyboardAvoidingView, Platform, Keyboard, ScrollView } from 'react-native';

export default function OneRepMaxScreen() {
  const [weight, setWeight] = useState<string>('');  
  const [reps, setReps] = useState<string>('');      
  const [oneRepMax, setOneRepMax] = useState<string | null>(null); 

  // Function to calculate the One Rep Max using Epley's formula
  const calculateOneRepMax = () => {
    const weightNum = parseFloat(weight);
    const repsNum = parseFloat(reps);

    if (!isNaN(weightNum) && !isNaN(repsNum) && repsNum > 0) {
      const calculated1RM: number = weightNum * (1 + repsNum / 30);
      setOneRepMax(calculated1RM.toFixed(2));  
      Keyboard.dismiss();  
    } else {
      setOneRepMax(null); 
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        <Text style={styles.title}>One Rep Max Calculator</Text>

        {/* Input for weight */}
        <TextInput
          style={styles.input}
          placeholder="Enter weight lifted (kg)"
          keyboardType="numeric"
          returnKeyType="done"
          value={weight}
          onChangeText={setWeight}
        />

        {/* Input for reps */}
        <TextInput
          style={styles.input}
          placeholder="Enter number of reps"
          keyboardType="numeric"
          returnKeyType="done"
          value={reps}
          onChangeText={setReps}
        />

        {/* Button to calculate 1RM */}
        <Button title="Calculate 1RM" onPress={calculateOneRepMax} />

        {oneRepMax && (
          <Text style={styles.resultText}>
            Estimated One Rep Max: {oneRepMax} kg
          </Text>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#1c1c1e',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    color: '#fff',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    borderRadius: 5,
    color: '#fff',
  },
  resultText: {
    fontSize: 18,
    color: '#fff',
    marginTop: 20,
    textAlign: 'center',
  },
  scrollViewContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
});