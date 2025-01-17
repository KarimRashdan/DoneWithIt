import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Keyboard, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ExerciseEntry {
  name: string;
  sets: SetEntry[];
}

interface SetEntry {
  reps: string;
  weight: string;
  date: string;
}

export default function ExercisesScreen() {
  const [exerciseName, setExerciseName] = useState(''); 
  const [exercises, setExercises] = useState<ExerciseEntry[]>([]); 
  const [isExpanded, setIsExpanded] = useState<number | null>(null); 
  const [reps, setReps] = useState(''); 
  const [weight, setWeight] = useState(''); 

  // Load exercises from AsyncStorage
  useEffect(() => {
    const loadExercises = async () => {
      try {
        const savedExercises = await AsyncStorage.getItem('exercises');
        if (savedExercises) {
          setExercises(JSON.parse(savedExercises));
        }
      } catch (error) {
        console.error('Failed to load exercises:', error);
      }
    };
    loadExercises();
  }, []);

  // Save exercises to AsyncStorage
  const saveExercises = async (updatedExercises: ExerciseEntry[]) => {
    try {
      await AsyncStorage.setItem('exercises', JSON.stringify(updatedExercises));
    } catch (error) {
      console.error('Failed to save exercises:', error);
    }
  };

  const addExercise = () => {
    if (exerciseName.trim()) {
      const newExercise = { name: exerciseName, sets: [] };
      const updatedExercises = [newExercise, ...exercises]; // Add to the top
      setExercises(updatedExercises);
      saveExercises(updatedExercises);
      setExerciseName('');
      Keyboard.dismiss();
    }
  };

  const addSet = (index: number) => {
    if (reps && weight) {
      const newSet = { reps, weight, date: new Date().toLocaleDateString() }; 
      const updatedExercises = exercises.map((exercise, i) => {
        if (i === index) {
          const updatedSets = [...exercise.sets, newSet];
          return { ...exercise, sets: updatedSets };
        }
        return exercise;
      });
      setExercises(updatedExercises);
      saveExercises(updatedExercises);
      setReps('');
      setWeight('');
      Keyboard.dismiss(); 
    }
  };

  // Delete an exercise
  const deleteExercise = (index: number) => {
    const updatedExercises = exercises.filter((_, i) => i !== index); 
    setExercises(updatedExercises);
    saveExercises(updatedExercises); // Save the updated exercises list
  };

  const toggleExpand = (index: number) => {
    setIsExpanded(isExpanded === index ? null : index); 
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        <Text style={styles.title}>Add Your Exercises</Text>

        {/* Input for adding a new exercise */}
        <TextInput
          style={styles.input}
          placeholder="Enter exercise name"
          value={exerciseName}
          onChangeText={setExerciseName}
          returnKeyType="done" 
          onSubmitEditing={addExercise} 
        />
        <Button title="Add Exercise" onPress={addExercise} />

        {/* Display the list of exercises */}
        {exercises.length > 0 ? (
          exercises.map((exercise, index) => (
            <View key={index} style={styles.exerciseContainer}>
              {/* Exercise Title with toggle to expand/collapse */}
              <TouchableOpacity onPress={() => toggleExpand(index)} style={styles.expandableHeader}>
                <Text style={styles.exerciseTitle}>{exercise.name}</Text>
                <Ionicons
                  name={isExpanded === index ? 'chevron-up-outline' : 'chevron-down-outline'}
                  size={20}
                  color="white"
                />
              </TouchableOpacity>

              {/* Expandable content for logging sets */}
              {isExpanded === index && (
                <View style={styles.expandableContent}>
                  {/* Log Reps */}
                  <TextInput
                    style={styles.input}
                    placeholder="Enter reps"
                    keyboardType="numeric"
                    returnKeyType="done"
                    value={reps}
                    onChangeText={setReps}
                    onSubmitEditing={() => addSet(index)} 
                  />
                  {/* Log Weight */}
                  <TextInput
                    style={styles.input}
                    placeholder="Enter weight"
                    keyboardType="numeric"
                    returnKeyType="done"
                    value={weight}
                    onChangeText={setWeight}
                    onSubmitEditing={() => addSet(index)} 
                  />

                  {/* Display logged sets with the date */}
                  {exercise.sets.length > 0 && (
                    exercise.sets.slice().reverse().map((set, i) => (
                      <Text key={i} style={styles.setText}>
                        {`${set.date}: ${set.reps} reps @ ${set.weight} kg`}
                      </Text>
                    ))
                  )}

                  {/* Delete Exercise Button inside the expanded tab */}
                  <TouchableOpacity onPress={() => deleteExercise(index)} style={styles.deleteButton}>
                    <Ionicons name="trash-outline" size={20} color="red" />
                    <Text style={styles.deleteText}>Delete Exercise</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))
        ) : (
          <Text style={styles.noEntries}>No exercises added yet</Text>
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
  exerciseContainer: {
    marginTop: 20,
    backgroundColor: '#333',
    padding: 10,
    borderRadius: 5,
  },
  expandableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exerciseTitle: {
    fontSize: 16,
    color: 'white',
  },
  expandableContent: {
    backgroundColor: '#444',
    padding: 15,
    borderRadius: 5,
    marginTop: 10,
  },
  setText: {
    color: 'white',
    fontSize: 16,
    marginBottom: 5,
  },
  noEntries: {
    color: 'white',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  scrollViewContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  deleteText: {
    color: 'red',
    marginLeft: 5,
    fontSize: 16,
  },
});