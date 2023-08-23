import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faEnvelope, faWeight, faClock, faAppleAlt } from '@fortawesome/free-solid-svg-icons';
import { useState, useEffect } from 'react';
import { getUserRepo } from '../repos/UserRepo'; // Make sure the path is correct
import { auth } from '../firebase';

const HomePage = ({ navigation }) => {
  const progress = 0.73; // Example progress value
  const today = 880; // Example value for today's calories
  const target = 1200; // Example value for target calories
  const dayStreak = 23; // Example value for days streak
  const [user, setUser] = useState({});
  const currentUserEmail = auth.currentUser && auth.currentUser.email;

  useEffect(() => {
    const fetchUser = async () => {
      const userRepo = getUserRepo();
      const userData = await userRepo.getUserByEmail(currentUserEmail);
      setUser(userData || {});
    };

    if (currentUserEmail) {
      fetchUser();
    }
  }, [currentUserEmail]);

  return (
    <View style={styles.container}>
      <View style={styles.searchBarContainer}>
        <TextInput placeholder="Search" style={styles.searchBar} />
        <TouchableOpacity style={styles.mailButton}>
          <FontAwesomeIcon icon={faEnvelope} size={20} color="white" />
        </TouchableOpacity>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
      <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
        <View style={styles.userCard}>
            <Image 
                source={{ uri: user.photoURL || 'https://via.placeholder.com/150' }} 
                style={styles.userImage}
            />
            <View style={styles.userDetails}>
                <Text style={styles.greeting}>Welcome, {user.username || "User"}!</Text>
                <Text style={styles.tapText}>Tap to view account details</Text>
            </View>
        </View>
    </TouchableOpacity>
    <View style={styles.buttonCardContainer}>
      <View style={styles.buttonRow}>
        {['Weight', 'Daily', 'Nutrition'].map((buttonLabel, index) => (
          <TouchableOpacity 
            key={index} 
            style={[styles.bigButton, styles.shadow]}
            onPress={() => {
              switch(buttonLabel) {
                case 'Weight':
                  navigation.navigate('Weight');
                  break;
                case 'Daily':
                  navigation.navigate('Daily');
                  break;
                case 'Nutrition':
                  navigation.navigate('Nutrition'); // Navigate to Nutrition screen when Tips button is clicked
                  break;
                default:
                  break;
              }
            }}
          >
            <FontAwesomeIcon icon={[faWeight, faClock, faAppleAlt][index]} size={30} color="white" />
            <Text style={styles.buttonText}>{buttonLabel}</Text>
          </TouchableOpacity>
        ))}
      </View>
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
      </ScrollView>
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
    borderRadius: 8,
    width: '30%',
  },
  buttonText: {
    color: '#ffffff',
    marginTop: 5,
  },
  targetProgressContainer: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 15,
    marginTop: 5,
    marginBottom: 5,
    marginLeft: 3,
    marginRight: 3,
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
    borderRadius: 15,
    marginTop: 5,
    marginBottom: 5,
    marginLeft: 3,
    marginRight: 3,
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
    borderRadius: 15,
    marginTop: 5,
    marginBottom: 5,
    marginLeft: 3,
    marginRight: 3,
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
  userCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 15,
    marginTop: 5,
    marginBottom: 5,
    marginLeft: 3,
    marginRight: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    alignItems: 'center',
  },
  userImage: {
      width: 60,
      height: 60,
      borderRadius: 30,
      marginRight: 20
  },
  userDetails: {
      flex: 1
  },
  greeting: {
      fontWeight: 'bold',
      fontSize: 16
  },
  tapText: {
      color: '#888',
      marginTop: 5
  },
  shadow: {
    elevation: 5,  // Android shadow
    shadowColor: 'black',  // iOS shadow
    shadowOffset: { width: 0, height: 2 },  // iOS shadow
    shadowOpacity: 0.25,  // iOS shadow
    shadowRadius: 3.84,  // iOS shadow
  },
  buttonCardContainer: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 15,
    marginTop: 5,
    marginBottom: 5,
    marginLeft: 3,
    marginRight: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',  // This ensures the buttons are centered vertically.
    width: '100%',        // This makes sure the buttons occupy the full width of the card.
  },
});

export default HomePage;
