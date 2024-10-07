import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Keyboard, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage

interface CalorieEntry {
  date: string;
  calories: string;
}

export default function CaloriesScreen() {
  const [calories, setCalories] = useState('');  // State for current calorie input
  const [calorieGoal, setCalorieGoal] = useState('');  // State for calorie goal
  const [savedGoal, setSavedGoal] = useState('');  // State to display saved goal
  const [isExpanded, setIsExpanded] = useState(false);  // State for toggling expandable section
  const [calorieEntries, setCalorieEntries] = useState<CalorieEntry[]>([]);  // State to store calorie entries

  // Load calorie entries and goal from AsyncStorage when the app starts
  useEffect(() => {
    const loadCalorieEntries = async () => {
      try {
        const savedEntries = await AsyncStorage.getItem('calorieEntries');
        if (savedEntries) {
          setCalorieEntries(JSON.parse(savedEntries));
        }

        const storedGoal = await AsyncStorage.getItem('calorieGoal');
        if (storedGoal) {
          setSavedGoal(storedGoal);
        }
      } catch (error) {
        console.error('Failed to load calorie entries or goal:', error);
      }
    };
    loadCalorieEntries();
  }, []);

  // Save calorie entries to AsyncStorage whenever they are updated
  const saveCalorieEntries = async (entries: CalorieEntry[]) => {
    try {
      await AsyncStorage.setItem('calorieEntries', JSON.stringify(entries));
    } catch (error) {
      console.error('Failed to save calorie entries:', error);
    }
  };

  // Save calorie goal to AsyncStorage
  const saveCalorieGoal = async (goal: string) => {
    try {
      await AsyncStorage.setItem('calorieGoal', goal);
      setSavedGoal(goal);  // Display the saved goal beneath the input
    } catch (error) {
      console.error('Failed to save calorie goal:', error);
    }
  };

  const logCalories = () => {
    if (calories) {
      const newEntry = {
        date: new Date().toLocaleDateString(),
        calories: calories,
      };
      const updatedEntries = [...calorieEntries, newEntry];
      setCalorieEntries(updatedEntries);  // Add the new entry to the calorie entries
      saveCalorieEntries(updatedEntries);  // Save to AsyncStorage
      setCalories('');  // Reset input box to empty string 
      Keyboard.dismiss();
    }
  };

  const deleteEntry = (index: number) => {
    const updatedEntries = calorieEntries.filter((_, i) => i !== index);  // Filter out the entry by index
    setCalorieEntries(updatedEntries);  // Update the state with the new array
    saveCalorieEntries(updatedEntries);  // Save the updated entries to AsyncStorage
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);  // Toggle the expand/collapse state
  };

  // Function to calculate how far away each logged calorie entry is from the goal
  const calculateDifference = (loggedCalories: string) => {
    if (!savedGoal) return '';  // No goal set, no difference to show
    const difference = Number(loggedCalories) - Number(savedGoal);  // Calculate difference
    return difference > 0 ? `+${difference}` : `${difference}`;  // Format with + or - sign
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}  // Adjust the behavior based on platform
    >
      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        <Text style={styles.title}>Log Your Calories</Text>

        {/* Text Input for Calorie Goal */}
        <TextInput
          style={styles.input}
          placeholder="Enter your calorie goal"
          keyboardType="numeric"
          returnKeyType="done"
          value={calorieGoal}
          onChangeText={setCalorieGoal}
          onSubmitEditing={() => {
            saveCalorieGoal(calorieGoal);
            setCalorieGoal('');  // Clear the input after saving the goal
          }}
        />

        {/* Display the current saved calorie goal */}
        {savedGoal ? (
          <Text style={styles.goalText}>Current Calorie Goal: {savedGoal} kcal</Text>
        ) : (
          <Text style={styles.goalText}>No calorie goal set yet.</Text>
        )}

        {/* Text Input for Logging Daily Calories */}
        <TextInput
          style={styles.input}
          placeholder="Enter calories"
          keyboardType="numeric"
          returnKeyType="done"
          value={calories}
          onChangeText={setCalories}
        />

        {/* Button to log calories */}
        <Button title="Log Calories" onPress={logCalories} />

        {/* Expandable Section */}
        <TouchableOpacity style={styles.expandableHeader} onPress={toggleExpand}>
          <Text style={styles.expandableTitle}>Calorie History</Text>
          <Ionicons
            name={isExpanded ? 'chevron-up-outline' : 'chevron-down-outline'}  // Toggle arrow icon
            size={20}
            color="white"
          />
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.expandableContent}>
            {/* Map through the calorieEntries array to display each logged entry */}
            {calorieEntries.length > 0 ? (
              calorieEntries.map((entry, index) => (
                <View key={index} style={styles.entry}>
                  <Text style={styles.entryText}>
                    {entry.date}: {entry.calories} kcal{' '}
                    {/* Add space and display how far from the goal */}
                    <Text style={styles.differenceText}>
                      ({calculateDifference(entry.calories)})
                    </Text>
                  </Text>
                  {/* Button to delete entry */}
                  <TouchableOpacity onPress={() => deleteEntry(index)}>
                    <Ionicons name="trash-outline" size={20} color="red" />
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <Text style={styles.noEntries}>No entries yet</Text>
            )}
          </View>
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
  goalText: {
    fontSize: 14,           // Smaller font size
    color: '#bbb',          // Grayed out text
    fontStyle: 'italic',    // Italicized text
    marginBottom: 20,
    textAlign: 'center',
  },
  expandableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 5,
    marginTop: 20,
  },
  expandableTitle: {
    fontSize: 16,
    color: 'white',
  },
  expandableContent: {
    backgroundColor: '#444',
    padding: 15,
    borderRadius: 5,
    marginTop: 10,
  },
  entry: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  entryText: {
    color: 'white',
    fontSize: 16,
  },
  differenceText: {
    color: '#bbb',           // Grayed out difference text
    fontSize: 14,            // Slightly smaller font size for the difference
    marginLeft: 10,          // Add some space between the calories and the difference
  },
  noEntries: {
    color: 'white',
    fontStyle: 'italic',
  },
  scrollViewContainer: {
    flexGrow: 1,  // Allows content to grow and scroll
    justifyContent: 'center',
  },
});
