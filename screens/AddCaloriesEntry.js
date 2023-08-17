import React, { useState, useEffect } from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import * as Location from 'expo-location';
import { Camera } from 'expo-camera';
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faCalendarAlt,
  faUtensils,
  faWeight,
  faCamera,
  faMapMarkerAlt
} from "@fortawesome/free-solid-svg-icons";
import * as ImagePicker from 'expo-image-picker';


const AddCaloriesEntry = ({ foodRepo, navigation }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [food, setFood] = useState("");
  const [amount, setAmount] = useState("");
  const [location, setLocation] = useState(null);
  const [image, setImage] = useState(null);
  const [cameraRef, setCameraRef] = useState(null); // new state for camera reference

  const handleConfirm = async () => {
    const entry = {
      name: food,
      calories: amount,
      location: location,
      image: image
    };
    await foodRepo.addObject(entry);
    navigation.navigate("ViewCaloriesRecord");
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

    if (!result.cancelled) {
      setImage(result.uri);
    }
  };

  const captureLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission to access location was denied');
      return;
    }
    let loc = await Location.getCurrentPositionAsync({});
    setLocation(loc.coords);
  };

  return (
    <View style={styles.container}>
      {/* Date Input */}
      <View style={styles.inputContainer}>
        <FontAwesomeIcon icon={faCalendarAlt} size={20} color="black" />
        <TextInput
          style={styles.input}
          placeholder="Date"
          value={selectedDate.toDateString()}
          onChangeText={(text) => setSelectedDate(text)}
        />
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

      {/* Amount Input */}
      <View style={styles.inputContainer}>
        <FontAwesomeIcon icon={faWeight} size={20} color="black" />
        <TextInput
          style={styles.input}
          placeholder="Amount"
          value={amount}
          onChangeText={(text) => setAmount(text)}
          keyboardType="numeric"
        />
      </View>

      {/* Location Button */}
      <TouchableOpacity style={styles.actionButton} onPress={captureLocation}>
        <FontAwesomeIcon icon={faMapMarkerAlt} size={20} color="black" />
        <Text style={styles.actionText}>Capture Location</Text>
      </TouchableOpacity>

      {location && (
        <Text style={styles.locationText}>
          Location: {location.latitude}, {location.longitude}
        </Text>
      )}

      {/* Camera preview and button */}

      <TouchableOpacity style={styles.actionButton} onPress={takePicture}>
        <FontAwesomeIcon icon={faCamera} size={20} color="black" />
        <Text style={styles.actionText}>Take Picture</Text>
      </TouchableOpacity>

      {image && (
        <Image source={{ uri: image }} style={styles.imagePreview} />
      )}

      {/* Confirm Button */}
      <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
        <Text style={styles.confirmButtonText}>Confirm</Text>
      </TouchableOpacity>
    </View>
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
});

export default AddCaloriesEntry;
