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


const AddCaloriesEntry = ({ foodRepo, navigation }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [food, setFood] = useState("");
  const [amount, setAmount] = useState("");
  const [location, setLocation] = useState(null);
  const [image, setImage] = useState(null);
  const [weight, setWeight] = useState("");
  const [datePickerMode, setDatePickerMode] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);



  const handleConfirm = async () => {
    const entry = {
      date: selectedDate,
      name: food,
      calories: amount,
      weight: weight,
      location: location,
      image: image
    };
    await foodRepo.addObject(entry);
    console.log("Trying to add this entry:", entry);
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
  
    if (!result.cancelled) {
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
