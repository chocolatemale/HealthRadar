import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert } from "react-native";
import { Modal, SafeAreaView, StatusBar } from 'react-native';
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faPlus,
  faCog,
  faCalendarAlt,
} from "@fortawesome/free-solid-svg-icons";
import { useIsFocused } from "@react-navigation/native";
import DateTimePicker from '@react-native-community/datetimepicker';
import MapView, { Marker } from 'react-native-maps';
import { Linking, Platform } from 'react-native';
import { ScrollView } from 'react-native';
import { auth } from '../firebase';

const ViewCaloriesRecord = ({ navigation, foodRepo, caloriesGoalRepo }) => {
  // Include the navigation prop
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [foodEntries, setFoodEntries] = useState([]);
  const [totalCalories, setTotalCalories] = useState(0);
  const isFocused = useIsFocused();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState("date");
  const [selectedEntry, setSelectedEntry] = useState(null);
  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(false); 
    if (selectedDate) {
      setSelectedDate(selectedDate);
    }
  };
  const [isImageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  
  useEffect(() => {
    if (isFocused) {
      foodRepo.getAllObjects().then((entries) => {
           // Here's where you'll adjust the filtering logic
        const filteredEntries = entries.filter(entry => {
            // Convert Firestore timestamp to JavaScript Date
            const entryDate = new Date(entry.date.seconds * 1000 + entry.date.nanoseconds / 1000000);
            
            return entryDate.toDateString() === selectedDate.toDateString();
        });

        setFoodEntries(filteredEntries);
        caloriesGoalRepo.getCaloriesGoal(auth.currentUser.uid).then(goal => {
          setCaloriesGoal(goal)});
      });
    }
  }, [foodRepo, isFocused, selectedDate]);

  useEffect(() => {
    setTotalCalories(
      foodEntries.reduce(
        (total, entry) => parseInt(total) + parseInt(entry.calories),
        0
      )
    );
  }, [foodEntries]);

  const renderImageModal = () => {
    return (
      <Modal
        visible={isImageModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setImageModalVisible(false)}
      >
        <TouchableOpacity
          style={modalStyles.modalContainer}
          onPress={() => setImageModalVisible(false)}
        >
          <Image source={{ uri: selectedImage }} style={modalStyles.fullImage} />
        </TouchableOpacity>
      </Modal>
    );
  };

  const [caloriesGoal, setCaloriesGoal] = useState(0); // Initialize to zero or some default value

  const handleCaloriesGoal = () => {
    Alert.prompt(
      "Set Calories Goal",
      "Enter your daily calories goal:",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "OK",
          onPress: (value) => {
            const parsedValue = parseInt(value);
            if (!isNaN(parsedValue)) {
              caloriesGoalRepo.setCaloriesGoal(parsedValue);
            } else {
              Alert.alert("Invalid Input", "Please enter a valid number.");
            }
          },
        },
      ],
      "plain-text",
      ""
    );
  };
  
  return (
    <>
    {renderImageModal()}
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
      <View style={styles.textAndSettingsContainer}>
        <Text style={styles.headerText}>Calories Record</Text>
        <TouchableOpacity
            style={styles.settingsButton}
            onPress={handleCaloriesGoal}
        >
            <FontAwesomeIcon icon={faCog} size={15} color="white" />
        </TouchableOpacity>
        </View>
        <TouchableOpacity
            style={styles.addRectangularButton}
            onPress={() => navigation.navigate("AddCaloriesEntry")}
        >
            <FontAwesomeIcon icon={faPlus} size={25} color="white" />
        </TouchableOpacity>
      </View>

      {/* List of Food Entries */}
      <ScrollView style={styles.entriesContainer}>
        {foodEntries.length == 0 ? (
          <Text style={styles.placeholderText}>No food entries yet</Text>
        ) : (
          foodEntries.map((entry) => (
            <TouchableOpacity 
              key={entry.id} 
              onPress={() => {
                setSelectedEntry(entry);
                navigation.navigate("AddCaloriesEntry", { selectedEntry: entry });
              }}
              style={styles.entry}>
              
              <View style={styles.leftContainer}>
                <Text style={styles.descriptionText}>{entry.name}</Text>
                <Text style={styles.weightText}>{entry.weight}g</Text>
              </View>
              
              <View style={styles.rightContainer}>
              {entry.image && (
                <TouchableOpacity onPress={() => {
                  setSelectedImage(entry.image);
                  setImageModalVisible(true);
                }}>
                  <Image source={{ uri: entry.image }} style={styles.imageStyle} />
                </TouchableOpacity>
              )}
                
                {entry.location && (
                  <TouchableOpacity
                    style={styles.mapContainer}
                    onPress={() => {
                      // Determine the platform to provide appropriate map URL
                      const url = Platform.OS === 'ios' 
                        ? `http://maps.apple.com/?ll=${entry.location.latitude},${entry.location.longitude}`
                        : `geo:${entry.location.latitude},${entry.location.longitude}`;
              
                      Linking.openURL(url);
                    }}
                  >
                    <MapView
                      style={styles.mapStyle}
                      initialRegion={{
                        latitude: entry.location.latitude,
                        longitude: entry.location.longitude,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                      }}
                      scrollEnabled={false}
                      zoomEnabled={false}
                      rotateEnabled={false}
                      pitchEnabled={false}
                      cacheEnabled={true}
                    >
                      <Marker
                        coordinate={{
                          latitude: entry.location.latitude,
                          longitude: entry.location.longitude,
                        }}
                      />
                    </MapView>
                  </TouchableOpacity>
                )}
              </View>

              <Text 
                style={[
                  styles.caloriesText, 
                  { color: parseInt(entry.calories) >= 100 ? 'red' : 'green' }
                ]}
              >
                {entry.calories.toLocaleString()} cal
              </Text>
            </TouchableOpacity>
          ))          
        )}
      </ScrollView>


      {/* Total Calories */}
      <View style={styles.totalContainer}>
        <View style={styles.inputContainer}>
            <FontAwesomeIcon icon={faCalendarAlt} size={20} color="black" />
            {datePickerMode ? (
                <DateTimePicker
                    value={selectedDate}
                    mode={datePickerMode}
                    is24Hour={true}
                    display="default"
                    onChange={(event, selectedDate) => {
                        setDatePickerMode(null);
                        if (selectedDate) {
                            setSelectedDate(selectedDate);
                        }
                    }}
                />
            ) : (
                <TouchableOpacity onPress={() => setDatePickerMode('date')}>
                    <Text style={styles.input}>{selectedDate.toDateString()}</Text>
                </TouchableOpacity>
            )}
        </View>

        <View style={styles.caloriesContainer}>
        {caloriesGoal !== null && (
        <Text 
          style={[
            styles.totalText, 
            { color: totalCalories <= caloriesGoal ? 'green' : 'red' }
          ]}
        >
          {`${totalCalories.toLocaleString()} / ${caloriesGoal.toLocaleString()} cal`}
        </Text>
        )}
        </View>
      </View>
    </View>
    </>
  );
};

const modalStyles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  fullImage: {
    width: "100%",
    height: "70%",
    resizeMode: "contain",
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f4f4",
    padding: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10, // Adjust this value to get desired distance
    marginTop: 10,    // Adjust this value to match the above one
  },
  textAndSettingsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },  
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  addButton: {
    backgroundColor: "#3498db",
    padding: 10,
    borderRadius: 20,
  },
  entriesContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
  },
  entryImage: {
    width: 80,
    height: 80,
    borderRadius: 40, // This will make it circular
    marginVertical: 10,
    alignSelf: 'center', // This will center the image
  },
  entryText: {
    marginVertical: 5,
    fontSize: 16,
  },  
  placeholderText: {
    textAlign: "center",
    color: "#999",
    fontSize: 16,
    paddingVertical: 20,
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
    height: 60,
  },
  calendarContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  caloriesContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  totalText: {
    fontWeight: "bold",
    fontSize: 18,
    width: 200,  // Adjusted width to accommodate up to 5 digits
    textAlign: 'right',
    paddingRight: 5,  // Adjust this value to move the text away from the right border
  },
  datePicker: {
    flexDirection: "row",
    alignItems: "center",
  },
  entry: {
    flexDirection: "row",
    backgroundColor: 'white',
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    height:80,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  leftContainer: {
    flexDirection: 'column',
    flex: 2.5, // Allocating space for the description and weight texts
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1.5, // Adjusting flex here ensures the right container doesn't occupy more space than necessary
  },
  descriptionContainer: {
    flexDirection: 'column',
  },
  descriptionText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  weightText: {
    fontSize: 14,
  },
  caloriesText: {
    fontSize: 18,
    marginLeft: 5,
    width: 75,  // Setting a width to accommodate a maximum of 3 digits
    color: 'green', // default color
    textAlign: 'right',  // Align the text to the right
  },
  mapStyle: {
    width: 40,
    height: 40,
    marginVertical: 5,
    borderRadius: 10,
  },
  mapContainer: {
    marginRight: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  input: {
    marginLeft: 10,
    color: 'black',
    fontSize: 16,
  },
  imageStyle: {
    width: 40,
    height: 40,
    marginVertical: 5,
    borderRadius: 10,
    marginRight: 10,
  },
  settingsButton: {
    backgroundColor: "#3498db",
    padding: 8,
    borderRadius: 15,
    marginLeft: 5, // Moving it closer to the text
  },
  addRectangularButton: {
    backgroundColor: "#3498db",
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 5,
    marginLeft: 'auto', // This will push the button to the far right

  },
});

export default ViewCaloriesRecord;
