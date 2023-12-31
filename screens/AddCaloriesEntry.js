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
import { auth, storage } from '../firebase';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import * as ImageManipulator from 'expo-image-manipulator';
import * as Notifications from 'expo-notifications';


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


  
  const uploadImageToFirebase = async (uri) => {
    // 1. Compress the image using expo-image-manipulator
    const compressedImage = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1000 } }], // This will resize the image to a max width of 1000 while maintaining the aspect ratio
      { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG } // This will compress the image to 70% of its original quality
    );
    const response = await fetch(compressedImage.uri);
    const blob = await response.blob();
    const userId = auth.currentUser.uid; // Using firebase auth to get the current user's ID
    const uploadRef = ref(storage, `user_images/${userId}/${Date.now().toString()}.jpg`); // Creates a reference to where the image will be saved

    return new Promise((resolve, reject) => {
        const uploadTask = uploadBytesResumable(uploadRef, blob);

        uploadTask.on('state_changed', 
            (snapshot) => {
                // Progress can be monitored here if needed
            },
            (error) => {
                reject(error);
            },
            async () => {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                resolve(downloadURL);
            }
        );
    });
  };

  const handleConfirm = async () => {
    // Check if food (description) or calories is empty
    // Check if food is empty or just whitespace
    if (!food.trim()) {
      Alert.alert('Validation Error', 'Description cannot be empty.');
      return;
    }

    // Check if amount is a valid number
    if (!amount) {
      Alert.alert('Validation Error', 'Calories should be valid and cannot be empty.');
      return;
    }

    // Check if amount is a valid number
    if (isNaN(Number(amount))) {
      Alert.alert('Validation Error', 'Calories should be valid and cannot be empty.');
      return;
    }

  
    // If weight is empty, default it to 0
    let finalWeight;

    if (selectedEntry && (typeof weight !== 'string' || !weight.trim())) {
        // If we are updating and no weight is provided, retain the original weight
        finalWeight = selectedEntry.weight;
    } else {
        // If weight is empty or not a string, default it to 0
        finalWeight = typeof weight === 'string' ? (weight.trim() ? Number(weight) : 0) : 0;
    }
    
    if (image) {
      try {
          const uploadedImageUrl = await uploadImageToFirebase(image);
          setImage(uploadedImageUrl);  // Update the image state with the Firebase URL
      } catch (error) {
          console.error("Error uploading image:", error);
          // Optionally, inform the user about the error with a Toast or Alert
          return;  // Exit the function if there's an error
      }
    }

    const entry = {
      date: selectedDate,
      name: food,
      calories: Number(amount),
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
    // Check and possibly ask for notification permissions
    checkNotificationPermission();
    navigation.navigate("ViewCaloriesRecord");
};


  const handleDelete = () => {
      Alert.alert(
          'Delete Entry', // Title of the alert
          'Are you sure you want to delete this entry?', // Message in the alert
          [
              {
                  text: 'Cancel',
                  onPress: () => console.log('Delete action canceled'), // Optionally handle the cancel press
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
      setImage(result.assets[0].uri);
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

  const handleLongPress = (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setLocation({ latitude, longitude });
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
      setImage(result.assets[0].uri);
    }
  };
  
  const scheduleCaloriesNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Log Your Calories Intake",
        body: "Remember to record your calories intake for this mealtime in the HealthRadar app!",
      },
      trigger: {
        hour: 9, // For 9 AM
        minute: 0,
        repeats: true,
      },
    });
  
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Log Your Calories Intake",
        body: "It's lunchtime! Remember to record your calories intake in the HealthRadar app!",
      },
      trigger: {
        hour: 13, // For 1 PM
        minute: 0,
        repeats: true,
      },
    });
  
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Log Your Calories Intake",
        body: "Had your dinner? Don't forget to log your calories in the HealthRadar app!",
      },
      trigger: {
        hour: 19, // For 7 PM
        minute: 0,
        repeats: true,
      },
    });
  };
  
  const checkNotificationPermission = async () => {
    const settings = await Notifications.getPermissionsAsync();
    if (
      settings.granted ||
      settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
    ) {
      scheduleCaloriesNotification();
    } else {
      const request = await Notifications.requestPermissionsAsync();
      if (
        request.granted ||
        request.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
      ) {
        scheduleCaloriesNotification();
      }
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
              onLongPress={handleLongPress}
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
    height: 200,
    marginBottom: 10,
  },
  rowContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
});

export default AddCaloriesEntry;
