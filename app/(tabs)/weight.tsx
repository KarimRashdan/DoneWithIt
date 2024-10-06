import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Keyboard, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Ensure you have the icons installed

export default function WeightScreen() {
  const [weight, setWeight] = useState('');  //  initialize 'weight' with an empty string, 'weight' holds current input value, 'setWeight' will be called to update 'weight' 
  const [isExpanded, setIsExpanded] = useState(false);  //  State for toggling expandable section

  const logWeight = () => {
    console.log('Logged weight: ${weight}');
    setWeight('');  //  Reset input box to empty string 
    Keyboard.dismiss();
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);  //  Toggle the expand/collapse state
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}  //  Adjust the behavior based on platform
    >
      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
      <Text style={styles.title}>Log Your Weight</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter weight in kg"
        keyboardType="numeric"
        returnKeyType="done"
        value={weight}
        onChangeText={setWeight}
      />

      {/* Button to log weight */}
      <Button title="Log Weight" onPress={logWeight} />

      {/* Expandable Section */}
      <TouchableOpacity style={styles.expandableHeader} onPress={toggleExpand}>
      <Text style={styles.expandableTitle}>More Weight Information</Text>
      <Ionicons
        name={isExpanded ? 'chevron-up-outline' : 'chevron-down-outline'} // Toggle arrow icon
        size={20}
        color="white"
      />
      </TouchableOpacity>

    {isExpanded && (
      <View style={styles.expandableContent}>
        <Text style={styles.expandableText}>Here you can add more information about your weight tracking.</Text>
        <Text style={styles.expandableText}>For example, track weight fluctuations, set weight goals, etc.</Text>
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
  expandableText: {
    color: 'white',
    marginBottom: 10,
  },
  scrollViewContainer: {
    flexGrow: 1,  //  Allows content to grow and scroll
    justifyContent: 'center',
  },
})

/*
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

  // Function to remove a logged entry
  const removeEntry = async (date: string) => {
    try {
      const updatedHistory = weightHistory.filter(entry => entry.date !== date);
      setWeightHistory(updatedHistory); // Update the state

      // Update AsyncStorage
      await AsyncStorage.setItem('weightHistory', JSON.stringify(updatedHistory));

      Alert.alert('Entry removed successfully');
    } catch (error) {
      Alert.alert('Failed to remove entry.');
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

  // Render function for the logged entries
  const renderEntry = ({ item }: { item: WeightEntry }) => (
    <View style={styles.entryContainer}>
      <Text style={styles.logged}>{item.date}: {item.weight} kg/lbs</Text>
      <TouchableOpacity style={styles.deleteButton} onPress={() => removeEntry(item.date)}>
        <Text style={styles.deleteText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

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

      <View style={styles.divider} />

      <Text style={styles.title}>Logged Entries</Text>
      <FlatList
        data={weightHistory}
        renderItem={renderEntry}
        keyExtractor={item => item.date}
      />
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
  entryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  deleteButton: {
    backgroundColor: 'red',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  deleteText: {
    color: '#fff',
  },
});
*/