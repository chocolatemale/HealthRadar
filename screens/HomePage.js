import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faEnvelope, faWeight, faClock, faAppleAlt, faHeart } from '@fortawesome/free-solid-svg-icons';
import { useState, useEffect } from 'react';
import { getUserRepo } from '../repos/UserRepo'; // Make sure the path is correct
import { auth } from '../firebase';
import { database } from '../firebase';
import { getDocs, collection, query, where, orderBy } from 'firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';
import {getCaloriesGoalRepo} from '../repos/FirebaseRepo'
import { getFirebaseRepo } from "../repos/FirebaseRepo";
import { getFoodDetails
} from '../api/Nutritionix';

const fetchMostRecentVisited = async () => {
  const userId = auth.currentUser.uid;
  const visitRepo = getFirebaseRepo("visitedFoods", userId);
  const history = await visitRepo.getAllObjects();

  if (history.length) {
    // Sort the history records based on the timestamp in descending order
    history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    const mostRecent = history[0];
    try {
      const foodDetails = await getFoodDetails(mostRecent.foodId, mostRecent.type);
      if (foodDetails && foodDetails.foods && foodDetails.foods[0]) {
        return foodDetails.foods[0];
      }
    } catch (error) {
      console.warn("Error fetching details for visited food:", mostRecent.foodId, error);
      return null;
    }
  }
  return null;
};

const HomePage = ({ navigation }) => {
  const dayStreak = 23; // Example value for days streak
  const [user, setUser] = useState({});
  const currentUserEmail = auth.currentUser && auth.currentUser.email;
  const [initialWeight, setInitialWeight] = useState(null);
  const [latestWeight, setLatestWeight] = useState(null);
  const [weightTarget, setWeightTarget] = useState(null);
  const userId = auth.currentUser.uid;
  const [totalCaloriesToday, setTotalCaloriesToday] = useState(0);
  const [caloriesGoal, setCaloriesGoal] = useState(0);
  const [recentFood, setRecentFood] = useState(null);

  useFocusEffect(
  React.useCallback(() => {
    // Uncomment this if you want Recently Viewed to update each time Overview is in focus
    const fetchAndSetRecentFood = async () => {
      const food = await fetchMostRecentVisited();
      setRecentFood(food);
    };
    fetchAndSetRecentFood();

    const fetchUser = async () => {
      const userRepo = getUserRepo();
      const userData = await userRepo.getUserByEmail(currentUserEmail);
      setUser(userData || {});
    };
    const fetchWeightData = async () => {
      const userWeightCollection = collection(database, "weights");
      const userQuery = query(
        userWeightCollection,
        where("userId", "==", userId),
        orderBy("datetime", "desc")
      );
      const querySnapshot = await getDocs(userQuery);
      const weights = querySnapshot.docs.map((d) => ({
        ...d.data(),
        id: d.id,
      }));
  
      // If we have weight data:
      if (weights.length) {

        const latest = weights[0];
        setLatestWeight(latest.current);
        setWeightTarget(latest.target);
        const earliest = weights[weights.length - 1].current;
        setInitialWeight(earliest);
      }
      
    };
    

    if (currentUserEmail) {
      fetchUser();
      fetchWeightData();
    };

    const fetchCaloriesData = async () => {
      const today = new Date();
      const startOfDay = new Date(today);
      startOfDay.setHours(0, 0, 0, 0);
    
      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);
    
      const userFoodCollection = collection(database, "food");
      const todayQuery = query(
        userFoodCollection,
        where("userId", "==", userId),
        where("date", ">=", startOfDay),
        where("date", "<=", endOfDay)
      );
      
      const todaySnapshot = await getDocs(todayQuery);
      const todayTotalCalories = todaySnapshot.docs.reduce(
        (total, doc) => total + doc.data().calories, 0
      );
    
      setTotalCaloriesToday(todayTotalCalories);
    };    

    const fetchCaloriesGoal = async () => {
      const goalRepo = getCaloriesGoalRepo(userId);
      const goal = await goalRepo.getCaloriesGoal();
      setCaloriesGoal(goal || 0);
    };

    fetchCaloriesData();
    fetchCaloriesGoal();

    // Return a cleanup function to reset any state or stop side-effects.
    return () => {
      // For example, you might want to reset the user data when leaving the screen:
      setUser({});
    };
  }, [currentUserEmail])
);

  const progress = initialWeight && weightTarget
    ? Math.min(1, Math.abs(((latestWeight - initialWeight) / (weightTarget - initialWeight))))
    : 0;
  
  
  function capitalizeWords(string) {
    return string.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  }
  
  // Comment if you want Recently Viewed to update each time it is in focus
  // useEffect(() => {
  //   const fetchAndSetRecentFood = async () => {
  //       const food = await fetchMostRecentVisited();
  //       setRecentFood(food);
  //   };
    
  //   fetchAndSetRecentFood();
  // }, []);

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
          onPress={() => navigation.navigate('Weight')}
      >
          <Text style={styles.targetProgress}>
              Weight Progress from {initialWeight}kg to {weightTarget}kg
          </Text>
          <View style={styles.goalBarBackground}>
              <View style={{ ...styles.goalBar, width: `${progress * 100}%` }}>
                  <Text style={styles.progressText}>
                      {latestWeight ? `${latestWeight}kg, ` : ""}{`${(progress * 100).toFixed(0)}%`}
                  </Text>
              </View>
          </View>
      </TouchableOpacity>
      <TouchableOpacity
          style={styles.caloriesTodayContainer}
          onPress={() => {
            navigation.navigate('Daily');
          }}
      >
          <Text style={styles.caloriesToday}>Calories Today</Text>
          
          {/* New Component for Displaying Remaining/Exceeded Calories */}
          <View style={styles.calorieDifferenceContainer}>
              <Text style={[
                  styles.calorieDifferenceNumber, 
                  (caloriesGoal - totalCaloriesToday) > 0 ? styles.positive : styles.negative
              ]}>
                  {Math.abs(caloriesGoal - totalCaloriesToday).toLocaleString()} cal
              </Text>
              <Text style={styles.calorieDifferenceText}>
                  {(caloriesGoal - totalCaloriesToday) > 0 ? "remaining" : "exceeded"}
              </Text>
          </View>

          
          <Text style={styles.caloriesDetail}>
            Consumed: {totalCaloriesToday.toLocaleString()} cal / Target: {caloriesGoal.toLocaleString()} cal
          </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.recentlyViewedCard}
        onPress={() => {
            navigation.navigate('Nutrition');
        }}>
        <Text style={styles.caloriesToday}>Recently Viewed</Text>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={styles.foodLeftContainer}>
                <Image
                  source={{ uri: recentFood && recentFood.photo && recentFood.photo.thumb ? recentFood.photo.thumb : 'https://via.placeholder.com/150' }}
                  style={styles.foodImage}
                />
                <View style={styles.foodDetails}>
                <Text style={styles.foodName}>
                  {recentFood && recentFood.food_name ? capitalizeWords(recentFood.food_name) : 'N/A'}
                </Text>
                    <Text style={styles.foodBrand}>{recentFood && recentFood.brand_name ? recentFood.brand_name : 'Common Food'}</Text>
                </View>
            </View>

            <View style={styles.foodRightContainer}>
                <Text style={[
                    styles.caloriesText,
                    recentFood && recentFood.nf_calories && recentFood.nf_calories >= 200 ? styles.caloriesRed : styles.caloriesGreen
                ]}>
                    {recentFood && recentFood.nf_calories ? `${Math.round(recentFood.nf_calories)} cal` : 'N/A'}
                </Text>
                <Text style={styles.servingSize}>
                    {recentFood && recentFood.serving_qty ? recentFood.serving_qty : 'N/A'} {recentFood && recentFood.serving_unit ? recentFood.serving_unit : ''}
                </Text>
            </View>
        </View>
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
    backgroundColor: '#E0E0E0',  // Light grey for clearer distinction
    height: 20,
    borderRadius: 5,
    position: 'relative',  // This is needed for absolute positioning of the weight texts
    elevation: 5,  // Android shadow
    shadowColor: 'black',  // iOS shadow
    shadowOffset: { width: 0, height: 2 },  // iOS shadow
    shadowOpacity: 0.25,  // iOS shadow
    shadowRadius: 3.84,  // iOS shadow
  },
  goalBar: {
    height: 20,
    // Use a gradient color from light blue to deep blue for a cooler appearance:
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'flex-end',
    borderRadius: 5,
    overflow: 'hidden' // Ensure child components don't exceed this component
  },
  progressText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    paddingRight: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background for better readability
    padding: 2,
    borderRadius: 3,
    overflow: 'hidden',
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
  caloriesDetail: {
    fontSize: 14,
    color: "gray",
  },
  calorieDifferenceContainer: {
    flexDirection: 'row', 
    alignItems: 'baseline', // aligns the big number and the small text at their base
    marginBottom: 10,
    width: '100%', // ensures the container takes the full width of its parent
  },
  calorieDifferenceNumber: {
    fontWeight: 'bold',
    fontSize: 24, // big number
  },
  calorieDifferenceText: {
    fontSize: 14, // smaller font size
    color: "gray", 
    marginLeft: 5,
  },
  positive: {
    color: '#4CAF50', // soft green color
  },
  negative: {
    color: '#FF5252', // soft red color
  },
  recentlyViewedCard: {
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
  foodLeftContainer: {
      flexDirection: 'row',
      alignItems: 'center',
  },
  foodImage: {
      width: 50,
      height: 50,
      borderRadius: 25,
  },
  foodDetails: {
      marginLeft: 10,
  },
  foodName: {
      fontWeight: 'bold',
  },
  foodType: {
      color: 'gray',
  },
  foodRightContainer: {
      flex: 1,
      alignItems: 'flex-end',
  },
  caloriesText: {
      fontWeight: 'bold',
  },
  caloriesRed: {
      color: '#FF5252',
  },
  caloriesGreen: {
      color: '#4CAF50',
  },
  servingSize: {
      color: 'gray',
  },
  });

export default HomePage;