import React, { useState, useEffect } from "react";
import { ScrollView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import MapView, { Marker } from 'react-native-maps';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import * as Location from 'expo-location';
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faCalendarAlt,
  faUtensils,
  faWeight,
  faCamera,
  faMapMarkerAlt,
  faImages,
  faBurn,
} from "@fortawesome/free-solid-svg-icons";
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';


const AddCaloriesEntry = ({ route, foodRepo, navigation }) => {
  const selectedEntry = route.params?.selectedEntry;
  const [selectedDate, setSelectedDate] = useState(selectedEntry ? new Date(selectedEntry.date.toDate()) : new Date());
  const [food, setFood] = useState(selectedEntry ? selectedEntry.name : "");
  const [amount, setAmount] = useState(selectedEntry ? selectedEntry.calories : "");
  const [location, setLocation] = useState(selectedEntry ? selectedEntry.location : null);
  const [image, setImage] = useState(selectedEntry ? selectedEntry.image : null);
  const [weight, setWeight] = useState(selectedEntry ? selectedEntry.weight : "");  
  const [datePickerMode, setDatePickerMode] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);



  const handleConfirm = async () => {
    // Check if food (description) or calories is empty
    if (!food.trim() || !amount.trim()) {
        Alert.alert('Validation Error', 'Description and calories cannot be empty.');
        return;
    }

    // If weight is empty, default it to 0
    const finalWeight = weight.trim() ? weight : "0";

    const entry = {
        date: selectedDate,
        name: food,
        calories: amount,
        weight: finalWeight,
        location: location,
        image: image
    };

    if (selectedEntry) {
        // We are in update mode
        try {
            await foodRepo.updateObject(selectedEntry.id, entry);  // Assuming this is the update method
            console.log("Updated the entry:", entry);
        } catch (error) {
            console.error("Error updating entry:", error);
            // Optionally, inform the user about the error with a Toast or Alert
        }
    } else {
        // We are in creation mode
        try {
            await foodRepo.addObject(entry);
            console.log("Added a new entry:", entry);
        } catch (error) {
            console.error("Error adding new entry:", error);
            // Optionally, inform the user about the error with a Toast or Alert
        }
    }

    navigation.navigate("ViewCaloriesRecord");
};


  const handleDelete = () => {
      Alert.alert(
          'Delete Entry', // Title of the alert
          'Are you sure you want to delete this entry?', // Message in the alert
          [
              {
                  text: 'Cancel',
                  onPress: () => console.log('Delete action cancelled'), // Optionally handle the cancel press
                  style: 'cancel',
              },
              {
                  text: 'Delete',
                  onPress: async () => {
                      try {
                          await foodRepo.removeObject(selectedEntry.id); 
                          navigation.navigate("ViewCaloriesRecord");
                      } catch (error) {
                          console.error("Error deleting entry:", error);
                          // Optionally, inform the user about the error with a Toast or Alert
                      }
                  },
                  style: 'destructive', // This will make the button red on iOS
              },
          ],
          { cancelable: true } // This allows the user to cancel the alert by tapping outside of it
      );
  };
  
  const takePicture = async () => {
    let { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission to access camera was denied');
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.uri);
    }
  };

  const captureLocation = async () => {
    setLoadingLocation(true);
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
        alert('Permission to access location was denied');
        setLoadingLocation(false);
        return;
    }
    let loc = await Location.getCurrentPositionAsync({});
    setLocation(loc.coords);
    setLoadingLocation(false);
  };


  const selectPictureFromLibrary = async () => {
    let { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission to access media library was denied');
      return;
    }
  
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
  
    if (!result.canceled) {
      setImage(result.uri);
    }
  };
  

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Date Input */}
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

      {/* Calories Input */}
      <View style={styles.rowContainer}>
        {/* Calories Input */}
        <View style={{ ...styles.inputContainer, flex: 1 }}>
            <FontAwesomeIcon icon={faBurn} size={20} color="black" />
            <TextInput
                style={styles.input}
                placeholder="Calories"
                value={String(amount)}
                onChangeText={(text) => {
                    if (text === "" || /^[0-9]+$/.test(text)) {
                        setAmount(text);
                    }
                }}
                keyboardType="numeric"
            />
        </View>

        {/* Weight Input */}
        <View style={{ ...styles.inputContainer, flex: 1, marginLeft: 10 }}>
            <FontAwesomeIcon icon={faWeight} size={20} color="black" />
            <TextInput
                style={styles.input}
                placeholder="Weight (g)"
                value={String(weight)}
                onChangeText={(text) => {
                    if (text === "" || /^[0-9]+$/.test(text)) {
                        setWeight(text);
                    }
                }}
                keyboardType="numeric"
            />
        </View>
    </View>

      {/* Location Button */}
      <TouchableOpacity style={styles.actionButton} onPress={captureLocation}>
        <FontAwesomeIcon icon={faMapMarkerAlt} size={20} color="black" />
        <Text style={styles.actionText}>Capture Location</Text>
      </TouchableOpacity>
      
      {loadingLocation && <Text style={styles.loadingText}>Capturing location...</Text>}

      {location && (
          <MapView
              style={styles.map}
              initialRegion={{
                  latitude: location.latitude,
                  longitude: location.longitude,
                  latitudeDelta: 0.005,
                  longitudeDelta: 0.005,
              }}
          >
              <Marker
                  coordinate={location}
                  title="Your Location"
              />
          </MapView>
      )}

      {/* Camera preview and button */}

      <View style={styles.rowContainer}>
          {/* Take Picture Button */}
          <TouchableOpacity 
              style={{ ...styles.actionButton, flex: 1 }} 
              onPress={takePicture}
          >
              <FontAwesomeIcon icon={faCamera} size={20} color="black" />
              <Text style={styles.actionText}>Take Picture</Text>
          </TouchableOpacity>

          {/* Select from Library Button */}
          <TouchableOpacity 
              style={{ ...styles.actionButton, flex: 1, marginLeft: 10 }} 
              onPress={selectPictureFromLibrary}
          >
              <FontAwesomeIcon icon={faImages} size={20} color="black" />
              <Text style={styles.actionText}>Select from Library</Text>
          </TouchableOpacity>
      </View>
      
      {image && (
        <Image source={{ uri: image }} style={styles.imagePreview} />
      )}

      {/* Confirm Button */}
      <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
        <Text style={styles.confirmButtonText}>Confirm</Text>
      </TouchableOpacity>
      
      {/* Delete Button */}
      {selectedEntry && (
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      )}

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f4f4",
    padding: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 15,
    marginBottom: 20,
    shadowColor: "#000",
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
    backgroundColor: "#3498db",
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  confirmButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
  deleteButton: {
    backgroundColor: "#e74c3c",
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
    marginTop: 15,
  },
  deleteButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e4e4e4",
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 15,
    marginBottom: 10,
  },
  actionText: {
    marginLeft: 10,
  },
  locationText: {
    fontSize: 16,
    marginBottom: 10,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 15,
    marginBottom: 10,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  map: {
    width: '100%',
    height: 100,
    marginBottom: 10,
  },
  rowContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
});

export default AddCaloriesEntry;
