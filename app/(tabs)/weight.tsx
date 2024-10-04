import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface WeightEntry {
  date: string;
  weight: number;
}

export default function WeightScreen() {
  const [weight, setWeight] = useState<string>(''); // Input weight as string
  const [loggedWeight, setLoggedWeight] = useState<number | null>(null); // Logged weight
  const [targetWeight, setTargetWeight] = useState<string>(''); // Target weight as string
  const [weightHistory, setWeightHistory] = useState<WeightEntry[]>([]); // History of weights

  const currentDate = new Date().toLocaleDateString();

  // Fetch the logged weight for today and weight history when the component mounts
  useEffect(() => {
    const getLoggedWeight = async () => {
      try {
        const savedWeight = await AsyncStorage.getItem(currentDate);
        if (savedWeight !== null) {
          setLoggedWeight(parseFloat(savedWeight));  // Parse stored string as float
        }

        const storedHistory = await AsyncStorage.getItem('weightHistory');
        if (storedHistory !== null) {
          setWeightHistory(JSON.parse(storedHistory));  // Ensure it's an array
        }
      } catch (error) {
        Alert.alert('Failed to retrieve weight.');
      }
    };

    getLoggedWeight();
  }, []);

  // Function to log the weight
  const saveWeight = async () => {
    const weightNumber = parseFloat(weight);  // Convert input to a number
    if (isNaN(weightNumber)) {
      Alert.alert('Please enter a valid weight.');
      return;
    }

    try {
      const updatedHistory: WeightEntry[] = [...weightHistory, { date: currentDate, weight: weightNumber }];
      await AsyncStorage.setItem(currentDate, weightNumber.toString());  // Save as string
      await AsyncStorage.setItem('weightHistory', JSON.stringify(updatedHistory));  // Save history

      setLoggedWeight(weightNumber);  // Store as number
      setWeightHistory(updatedHistory);  // Update weight history
      setWeight('');  // Clear input field
      Alert.alert('Weight logged successfully');
    } catch (error) {
      Alert.alert('Failed to save weight.');
    }
  };

  // Function to calculate the average weight change over the past week or month
  const calculateAverageChange = (): string => {
    if (weightHistory.length < 2) {
      return 'Not enough data to calculate change';
    }

    const weights = weightHistory.map(entry => entry.weight);  // Extract weight from each entry
    const averageChange = (weights[weights.length - 1] - weights[0]) / weights.length;

    return averageChange.toFixed(2);
  };

  // Notify if the target is reached
  const checkTarget = (): string => {
    if (targetWeight && loggedWeight) {
      const difference = Math.abs(parseFloat(loggedWeight.toString()) - parseFloat(targetWeight));
      return `You are ${difference}kg away from your target.`;
    }
    return 'Set a target weight to track progress.';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Log your Daily Weight</Text>

      {loggedWeight !== null ? (
        <Text style={styles.logged}>Today's Logged Weight: {loggedWeight} kg/lbs</Text>
      ) : (
        <Text style={styles.logged}>No weight logged for today.</Text>
      )}

      <TextInput
        style={styles.input}
        placeholder="Enter your weight (kg/lbs)"
        placeholderTextColor="#aaa"
        keyboardType="numeric"
        value={weight}
        onChangeText={setWeight}
      />
      <Button title="Log Weight" onPress={saveWeight} />

      <View style={styles.divider} />

      <Text style={styles.title}>Set Target Weight</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your target weight"
        placeholderTextColor="#aaa"
        keyboardType="numeric"
        value={targetWeight}
        onChangeText={setTargetWeight}
      />
      <Text style={styles.logged}>{checkTarget()}</Text>

      <View style={styles.divider} />

      <Text style={styles.title}>Average Weight Change</Text>
      <Text style={styles.logged}>{calculateAverageChange()} kg/lbs per day</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#000', // Black background for contrast
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
    textAlign: 'center',
    color: '#fff', // White text
  },
  logged: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
    color: '#fff', // White text
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    borderRadius: 5,
    color: '#fff', // White text input
  },
  divider: {
    height: 1,
    backgroundColor: '#333',
    marginVertical: 20,
  },
});
