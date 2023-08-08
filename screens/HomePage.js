import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';

const HomePage = () => {
  const progress = 0.73; // Example progress value

  // Test values for the pie chart
  const now = 880;
  const target = 1200;

  return (
    <View style={styles.container}>
      <View style={styles.searchBarContainer}>
        <TextInput placeholder="Search" style={styles.searchBar} />
        <TouchableOpacity style={styles.mailButton}>
          <Icon name="envelope" size={20} color="white" />
        </TouchableOpacity>
      </View>
      <View style={styles.buttonRow}>
        {['Target weight', 'Food information', 'Tips'].map((buttonLabel, index) => (
          <TouchableOpacity key={index} style={styles.bigButton}>
            <Icon name={['weight', 'apple-alt', 'lightbulb'][index]} size={20} color="white" />
            <Text style={styles.buttonText}>{buttonLabel}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity style={styles.goalContainer}>
        <Text style={styles.targetProgress}>Target Progress</Text>
        <View style={styles.goalBarBackground}>
          <View style={{ ...styles.goalBar, width: `${progress * 100}%` }}>
            <Text style={styles.progressText}>{`${(progress * 100).toFixed(0)}%`}</Text>
          </View>
        </View>
      </TouchableOpacity>
      <View style={styles.infoCard}>
        <Text>Calories taken today/goal:</Text>
        {/* Add the pie chart component here */}
        <Text style={styles.placeholderChart}>[Pie Chart Placeholder]</Text>
      </View>
      <View style={styles.streakCard}>
        <Text>Days streak: 23</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
    padding: 10,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  searchBar: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 10,
    flex: 1,
    backgroundColor: '#ffffff',
  },
  mailButton: {
    padding: 10,
    backgroundColor: '#2c3e50',
    borderRadius: 20,
    marginLeft: 5,
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
    borderRadius: 8,
    width: '30%',
  },
  buttonText: {
    color: '#ffffff',
  },
  goalContainer: {
    backgroundColor: '#ffffff',
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  targetProgress: {
    fontWeight: 'bold',
    marginBottom: 5,
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
  infoCard: {
    padding: 15,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    margin: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
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
  },
});

export default HomePage;
