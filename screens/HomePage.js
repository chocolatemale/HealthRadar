import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faEnvelope, faWeight, faUtensils, faLightbulb } from '@fortawesome/free-solid-svg-icons';

const HomePage = ({ navigation }) => {
  const progress = 0.73;
  const today = 880;
  const target = 1200;
  const dayStreak = 23;

  const handleButtonPress = (buttonLabel) => {
    if (buttonLabel === 'Food') {
      navigation.navigate('Daily');
    } else if (buttonLabel === 'Weight') {
      navigation.navigate('WeightScreen');
    }
    // Add further navigation actions for other buttons if required in the future.
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBarContainer}>
        <TextInput placeholder="Search" style={styles.searchBar} />
        <TouchableOpacity style={styles.mailButton}>
          <FontAwesomeIcon icon={faEnvelope} size={20} color="white" />
        </TouchableOpacity>
      </View>
      <View style={styles.buttonRow}>
        {['Weight', 'Food', 'Tips'].map((buttonLabel, index) => (
          <TouchableOpacity 
            key={index} 
            style={[styles.bigButton, styles.shadow]}
            onPress={() => handleButtonPress(buttonLabel)}
          >
            <FontAwesomeIcon icon={[faWeight, faUtensils, faLightbulb][index]} size={30} color="white" />
            <Text style={styles.buttonText}>{buttonLabel}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity
        style={styles.targetProgressContainer}
        onPress={() => navigation.navigate('TargetProgress')}
      >
        <Text style={styles.targetProgress}>Target Progress</Text>
        <View style={styles.goalBarBackground}>
          <View style={{ ...styles.goalBar, width: `${progress * 100}%` }}>
            <Text style={styles.progressText}>{`${(progress * 100).toFixed(0)}%`}</Text>
          </View>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.caloriesTodayContainer}
        onPress={() => {
          navigation.navigate('Daily');
        }}
      >
        <Text style={styles.caloriesToday}>Calories Daily</Text>
        <Text style={styles.placeholderChart}>[Pie Chart Placeholder]</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.streakCard}
        onPress={() => navigation.navigate('DaysStreak')}
      >
        <Text style={styles.daysStreak}>Days Streak</Text>
        <Text style={styles.streakNumber}>{dayStreak}</Text>
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
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  searchBar: {
    borderWidth: 1,
    borderRadius: 25,
    padding: 10,
    flex: 1,
    backgroundColor: '#ffffff',
    marginRight: 10,
    elevation: 5,  // Android shadow
    shadowColor: 'black',  // iOS shadow
    shadowOffset: { width: 0, height: 2 },  // iOS shadow
    shadowOpacity: 0.25,  // iOS shadow
    shadowRadius: 3.84,  // iOS shadow
  },
  mailButton: {
    padding: 10,
    backgroundColor: '#2c3e50',
    borderRadius: 25,
    elevation: 5,  // Android shadow
    shadowColor: 'black',  // iOS shadow
    shadowOffset: { width: 0, height: 2 },  // iOS shadow
    shadowOpacity: 0.25,  // iOS shadow
    shadowRadius: 3.84,  // iOS shadow
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  bigButton: {
    backgroundColor: '#3498db',
    paddingVertical: 15,
    paddingHorizontal: 10,
    alignItems: 'center',
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 5,
  },
  buttonText: {
    color: '#ffffff',
    marginTop: 5,
  },
  shadow: {
    elevation: 5,  // Android shadow
    shadowColor: 'black',  // iOS shadow
    shadowOffset: { width: 0, height: 2 },  // iOS shadow
    shadowOpacity: 0.25,  // iOS shadow
    shadowRadius: 3.84,  // iOS shadow
  },
  targetProgressContainer: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 10,
    marginTop: 10,
    margin: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
  },
  targetProgress: {
    fontWeight: 'bold',
    marginBottom: 10,
  },
  goalBarBackground: {
    backgroundColor: '#ADD8E6',
    height: 20,
    borderRadius: 5,
  },
  goalBar: {
    height: 20,
    backgroundColor: '#FFB6C1',
    justifyContent: 'center',
    alignItems: 'flex-end',
    borderRadius: 5,
  },
  progressText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    paddingRight: 5,
  },
  caloriesTodayContainer: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    margin: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
  },
  caloriesToday: {
    fontWeight: 'bold',
    marginBottom: 10,
  },
  placeholderChart: {
    textAlign: 'center',
    padding: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
  },
  streakCard: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    margin: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    alignItems: 'center',
  },
  daysStreak: {
    fontWeight: 'bold',
    marginBottom: 10,
  },
  streakNumber: {
    fontSize: 48,
    color: '#3498db',
  },
});

export default HomePage;
