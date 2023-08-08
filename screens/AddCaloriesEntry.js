import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCalendarAlt, faUtensils, faWeight } from '@fortawesome/free-solid-svg-icons';

const AddCaloriesEntry = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [food, setFood] = useState('');
  const [amount, setAmount] = useState('');

  const handleConfirm = () => {
    // Handle the confirmation logic here
  };

  return (
    <View style={styles.container}>
      {/* Date Input */}
      <View style={styles.inputContainer}>
        <FontAwesomeIcon icon={faCalendarAlt} size={20} color="black" />
        <TextInput
          style={styles.input}
          placeholder="Date"
          value={selectedDate.toDateString()}
          onChangeText={(text) => setSelectedDate(text)}
        />
      </View>

      {/* Food Input */}
      <View style={styles.inputContainer}>
        <FontAwesomeIcon icon={faUtensils} size={20} color="black" />
        <TextInput
          style={styles.input}
          placeholder="Food"
          value={food}
          onChangeText={(text) => setFood(text)}
        />
      </View>

      {/* Amount Input */}
      <View style={styles.inputContainer}>
        <FontAwesomeIcon icon={faWeight} size={20} color="black" />
        <TextInput
          style={styles.input}
          placeholder="Amount"
          value={amount}
          onChangeText={(text) => setAmount(text)}
          keyboardType="numeric"
        />
      </View>

      {/* Confirm Button */}
      <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
        <Text style={styles.confirmButtonText}>Confirm</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
    padding: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  input: {
    flex: 1,
    fontSize: 16,
    marginLeft: 15,
  },
  confirmButton: {
    backgroundColor: '#3498db',
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default AddCaloriesEntry;
