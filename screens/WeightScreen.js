import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from 'react-native';
import {
  VictoryLine,
  VictoryChart,
  VictoryTheme,
  VictoryAxis,
  VictoryVoronoiContainer,
  VictoryTooltip,
  VictoryLabel
} from 'victory-native';
import { database, auth } from '../firebase';
import {
  doc,
  setDoc,
  addDoc,
  getDocs,
  orderBy,
  collection,
  query,
  where,
} from 'firebase/firestore';

const WeightScreen = ({ navigation }) => {
  const [weightTarget, setWeightTarget] = useState('');
  const [latestWeight, setLatestWeight] = useState('');
  const [weightToGo, setWeightToGo] = useState(null);
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [weightData, setWeightData] = useState([]);
  const userId = auth.currentUser.uid;

  useEffect(() => {
    const fetchData = async () => {
      const userWeightCollection = collection(database, 'weights');
      const userQuery = query(
        userWeightCollection,
        where('userId', '==', userId),
        orderBy('datetime', 'desc')
      );
      const querySnapshot = await getDocs(userQuery);
      const weights = querySnapshot.docs.map((d) => ({
        ...d.data(),
        id: d.id,
      }));
      setWeightData(
        weights.reverse().map((w, index) => ({
          x: index, // Instead of a time-based value, use the index of the data point
          y: w.current,
          date: w.datetime.toDate(), // Store the date in a separate property
        }))
      );
      

      if (weights.length) {
        const { target, current } = weights[weights.length - 1];
        setWeightTarget(target);
        setLatestWeight(current);
        setWeightToGo(target - current);
      }
    };
    fetchData();
  }, []);

  const handleSave = async () => {
    if (parseFloat(weightTarget) > 200 || parseFloat(latestWeight) > 200) {
      Alert.alert('Error', 'Weight values must be under 200kg');
      return;
    }

    const userWeightCollection = collection(database, 'weights');
    try {
      await addDoc(userWeightCollection, {
        target: parseFloat(weightTarget),
        current: parseFloat(latestWeight),
        datetime: new Date(),
        userId: userId,
      });
      setWeightToGo(weightTarget - latestWeight);
      Alert.alert('Success', 'Entry saved successfully');
      Keyboard.dismiss(); // Add this line to dismiss the keyboard
    } catch (error) {
      Alert.alert('Error', 'Failed to save entry');
    }
  };

  const handleWeightTargetChange = (value) => {
    if (value <= 200) {
      setWeightTarget(value);
    }
  };

  const handleLatestWeightChange = (value) => {
    if (value <= 200) {
      setLatestWeight(value);
    }
  };

  const toggleEditTarget = () => {
    setIsEditingTarget(!isEditingTarget);
  };

  const confirmChange = async () => {
    try {
      const userWeightDoc = doc(database, 'weights', userId);
      await setDoc(userWeightDoc, { target: parseFloat(weightTarget) }, { merge: true });
      toggleEditTarget();
      Alert.alert('Success', 'Weight target updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update weight target');
    }
  };

  const weightDifferenceText = () => {
    if (weightToGo < 0) {
      return (
        <Text style={styles.infoText}>
          You need to lose <Text style={{ color: 'red' }}>{Math.abs(weightToGo)} kg</Text> to reach your goal!
        </Text>
      );
    } else {
      return (
        <Text style={styles.infoText}>
          You need to gain <Text style={{ color: 'green' }}>{weightToGo} kg</Text> to reach your goal!
        </Text>
      );
    }
  };
  
  
  return (
    <KeyboardAvoidingView
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    style={styles.container}
    >
    <ScrollView contentContainerStyle={styles.scrollViewContent}>
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <View style={styles.card}>
            <Text style={styles.title}>Weight Management</Text>
            <Text style={styles.subtitle}>
              Track your weight progress, set goals, and monitor trends. Stay consistent and reach your desired weight target!
            </Text>
            {weightData.length > 0 && (
            <View style={styles.chartContainer}>
              <VictoryChart
                theme={VictoryTheme.material}
                width={Dimensions.get('window').width - 70}
                height={300} // Increase the chart height for better visibility
                padding={{ top: 50, bottom: 50, left: 50, right: 30 }} // Adjust the left padding as needed
                containerComponent={
                  <VictoryVoronoiContainer
                    voronoiDimension="x"
                    labels={({ datum }) =>
                    `Date: ${datum.date.toDateString()}\nWeight: ${datum.y}kg`
                  }                  
                    labelComponent={
                      <VictoryTooltip cornerRadius={10} flyoutStyle={styles.tooltip} />
                    }
                  />
                }
              >
                <VictoryAxis
                tickFormat={(x) => {
                    const dataPoint = weightData[x];
                    if (dataPoint) {
                    const date = dataPoint.date;
                    return `${date.getMonth() + 1}/${date.getDate()}`;
                    }
                    return x;
                }}
                label="Date"
                style={{ axisLabel: styles.axisLabel }}
                tickLabelComponent={<VictoryLabel style={styles.axisTick} />}
                />
                <VictoryAxis
                  dependentAxis
                  label="Weight (kg)"
                  style={{
                    axisLabel: styles.yAxisLabel,
                    tickLabels: styles.axisTick,
                  }}
                />
                <VictoryLine
                  data={weightData}
                  style={{
                    data: { stroke: '#5c6bc0', strokeWidth: 2 },
                  }}
                />
              </VictoryChart>
            </View>
          )}
          <View style={styles.row}>
            <Text style={styles.text}>Weight Target:</Text>
            {isEditingTarget ? (
              <View style={styles.editContainer}>
                <TextInput
                value={String(weightTarget)}
                onChangeText={handleWeightTargetChange}
                style={[styles.input, styles.buttonWidth]}
                keyboardType="numeric"
                maxLength={3} 
                />
                <TouchableOpacity onPress={confirmChange} style={styles.confirmButton}>
                  <Text style={styles.buttonText}>Confirm</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.editContainer}>
                <Text style={styles.targetValue}>{weightTarget} kg</Text>
                <TouchableOpacity onPress={toggleEditTarget} style={styles.editButton}>
                  <Text style={styles.buttonText}>Edit</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          <View style={styles.row}>
            <Text style={styles.text}>Latest Weight:</Text>
            <TextInput
              value={String(latestWeight)}
              onChangeText={handleLatestWeightChange}
              style={[styles.input, styles.buttonWidth]}
              keyboardType="numeric"
              maxLength={3} // Limit the input to 3 digits
            />
          </View>
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Text style={styles.buttonText}>Save</Text>
          </TouchableOpacity>
          {weightToGo !== null && weightDifferenceText()}

        </View>
        </TouchableWithoutFeedback>
    </ScrollView>
  </KeyboardAvoidingView>
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
  chartContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  input: {
    fontSize: 18,
    height: 50, // Explicit height for the input, you may need to adjust this based on your requirement.
    paddingHorizontal: 15, // Using paddingHorizontal to only affect left and right padding.
    paddingVertical: 10, // Adjust the vertical padding to match the buttons.
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 15,
    elevation: 3,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    textAlign: 'center', // Center text horizontally
    textAlignVertical: 'center', // Center text vertically
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
    textAlign: 'center',
    fontSize: 18,
    marginTop: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  editContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#2c3e50',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: '#27ae60',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 10,
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  targetValue: {
    fontSize: 18,
    marginRight: 10,
  },
  tooltip: {
    fill: 'white',
    backgroundColor: '#5c6bc0',
    borderRadius: 10,
    padding: 10,
  },
  axisLabel: {
    padding: 30,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  axisTick: {
    fontSize: 12,
    fontWeight: 'normal',
    color: '#777',
  },
  yAxisLabel: {
    padding: 35, // Adjust this value to control the spacing
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 3, // for Android
    shadowColor: 'black', // for iOS
    shadowOffset: { width: 0, height: 2 }, // for iOS
    shadowOpacity: 0.25, // for iOS
    shadowRadius: 3.84, // for iOS
  },
  buttonWidth: {
    width: 60,
  },
});

export default WeightScreen;
