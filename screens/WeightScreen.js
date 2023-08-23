// /screens/WeightScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { database, auth } from '../firebase';
import { doc, setDoc, getDoc } from "firebase/firestore";

const WeightScreen = ({ navigation }) => {
  const [weightTarget, setWeightTarget] = useState('');
  const [latestWeight, setLatestWeight] = useState('');
  const [weightToGo, setWeightToGo] = useState(null);
  const userId = auth.currentUser.uid;

  useEffect(() => {
    const fetchData = async () => {
      const userWeightRef = doc(database, 'weights', userId);
      const userWeightDoc = await getDoc(userWeightRef);
      if (userWeightDoc.exists()) {
        const { target, current } = userWeightDoc.data();
        setWeightTarget(target);
        setLatestWeight(current);
        setWeightToGo(target - current);
      }
    };
    fetchData();
  }, []);

  const handleSave = async () => {
    const userWeightRef = doc(database, 'weights', userId);
    await setDoc(userWeightRef, {
      target: parseFloat(weightTarget),
      current: parseFloat(latestWeight)
    });
    setWeightToGo(weightTarget - latestWeight);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weight Management</Text>
      <TextInput
        placeholder="Set Weight Target"
        value={weightTarget}
        onChangeText={setWeightTarget}
        style={styles.input}
        keyboardType="numeric"
      />
      <TextInput
        placeholder="Record Latest Weight"
        value={latestWeight}
        onChangeText={setLatestWeight}
        style={styles.input}
        keyboardType="numeric"
      />
      <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
        <Text style={styles.buttonText}>Save</Text>
      </TouchableOpacity>
      {weightToGo && <Text style={styles.infoText}>You have {weightToGo}kg to reach your goal!</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 15,
    elevation: 3,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  saveButton: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 8,
    elevation: 3,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoText: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 18,
  },
});

export default WeightScreen;
