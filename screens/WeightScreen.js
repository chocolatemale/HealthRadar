import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert
} from 'react-native';
import { database, auth } from '../firebase';
import { doc, setDoc, addDoc, getDocs, orderBy, limit, collection, query, where } from "firebase/firestore";

const WeightScreen = ({ navigation }) => {
  const [weightTarget, setWeightTarget] = useState('');
  const [latestWeight, setLatestWeight] = useState('');
  const [weightToGo, setWeightToGo] = useState(null);
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const userId = auth.currentUser.uid;

  useEffect(() => {
    const fetchData = async () => {
      const userWeightCollection = collection(database, 'weights');
      const userQuery = query(userWeightCollection, where('userId', '==', userId), orderBy('datetime', 'desc'), limit(1));
      const querySnapshot = await getDocs(userQuery);
      const weights = querySnapshot.docs.map(d => ({ ...d.data(), id: d.id }));
      if (weights.length) {
        const { target, current } = weights[0];
        setWeightTarget(target);
        setLatestWeight(current);
        setWeightToGo(target - current);
      }
    };
    fetchData();
  }, []);

  const handleSave = async () => {
    const userWeightCollection = collection(database, 'weights');
    await addDoc(userWeightCollection, {
      target: parseFloat(weightTarget),
      current: parseFloat(latestWeight),
      datetime: new Date(),
      userId: userId
    });
    setWeightToGo(weightTarget - latestWeight);
  };


  const toggleEditTarget = () => {
    setIsEditingTarget(!isEditingTarget);
  };

  const confirmChange = () => {
    toggleEditTarget();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weight Management</Text>
      
      <View style={styles.row}>
        <Text style={styles.text}>Weight Target: {weightTarget}kg</Text>
        <TouchableOpacity onPress={toggleEditTarget} style={styles.editButton}>
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>
      </View>
      
      {isEditingTarget && (
        <>
          <TextInput
            value={String(weightTarget)}
            onChangeText={setWeightTarget}
            style={styles.input}
            keyboardType="numeric"
          />
          <TouchableOpacity onPress={confirmChange} style={styles.confirmButton}>
            <Text style={styles.buttonText}>Confirm Change</Text>
          </TouchableOpacity>
        </>
      )}
      
      <Text style={styles.text}>Latest Weight: {latestWeight}kg</Text>
      <TextInput
        placeholder="Record Latest Weight"
        value={String(latestWeight)}
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  editButton: {
    backgroundColor: '#2c3e50',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: '#27ae60',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
  },
});

export default WeightScreen;
