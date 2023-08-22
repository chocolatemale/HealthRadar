import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { getUserRepo } from '../repos/UserRepo';
import { auth, storage } from '../firebase';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Platform, Alert } from 'react-native';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const Profile = () => {
  const [user, setUser] = useState({});

  const currentUserEmail = auth.currentUser && auth.currentUser.email;

  useEffect(() => {
    if (Platform.OS !== 'web') {
      ImagePicker.requestMediaLibraryPermissionsAsync().then(response => {
        if (response.status !== 'granted') {
          alert('Sorry, we need camera roll permissions to make this work!');
        }
      });
      ImagePicker.requestCameraPermissionsAsync().then(response => {
        if (response.status !== 'granted') {
          alert('Sorry, we need camera permissions to make this work!');
        }
      });
    }
  }, []);

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

  const pickImage = async (fromCamera = false) => {
    let pickerResult;
    
    if (fromCamera) {
      pickerResult = await ImagePicker.launchCameraAsync();
    } else {
      pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });
    }

    if (!pickerResult.canceled) {
      const uri = pickerResult.assets[0].uri;  // Updated way to access uri
      uploadImage(uri);    }
  };

  const uploadImage = async (uri) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const storageRef = ref(storage, `profile_images/${auth.currentUser.uid}`);
    const uploadTask = uploadBytesResumable(storageRef, blob);

    uploadTask.on('state_changed', snapshot => {
      // You can show upload progress here if you want
    }, err => {
      console.log(err);
    }, async () => {
      const downloadURL = await getDownloadURL(storageRef);
      updateUserProfileImage(downloadURL);
    });
  };

  const updateUserProfileImage = async (imageUrl) => {
    const userRepo = getUserRepo();
    await userRepo.updateUser(currentUserEmail, { photoURL: imageUrl });
    setUser(prevState => ({ ...prevState, photoURL: imageUrl }));
  };

  const chooseImageOption = () => {
    Alert.alert("Choose a profile photo", "Would you like to...", [
      {
        text: "Upload from album",
        onPress: () => pickImage()
      },
      {
        text: "Take a picture",
        onPress: () => pickImage(true)
      },
      {
        text: "Cancel",
        style: "cancel"
      }
    ]);
  };

  const handleSignOut = () => {
    auth.signOut();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={chooseImageOption}>
          <Image 
            source={{ uri: user.photoURL || 'https://via.placeholder.com/150' }} 
            style={styles.profileImage}
          />
        </TouchableOpacity>
        <Text style={styles.profileName}>{user.username || "Unknown"}</Text>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.label}>Email:</Text>
        <Text style={styles.infoText}>{user.email || "Not provided"}</Text>

        <Text style={styles.label}>First Name:</Text>
        <Text style={styles.infoText}>{user.firstName || "Not provided"}</Text>

        <Text style={styles.label}>Last Name:</Text>
        <Text style={styles.infoText}>{user.lastName || "Not provided"}</Text>

        <Text style={styles.label}>Phone Number:</Text>
        <Text style={styles.infoText}>{user.phoneNumber || "Not provided"}</Text>
      </View>
      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutButtonText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  header: {
    backgroundColor: '#3498db',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 5,
    borderBottomColor: '#ddd',
    padding: 20,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 15,
    borderColor: '#FFF',
    borderWidth: 2,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  infoContainer: {
    padding: 20,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowOffset: { width: 0, height: -3 },
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 18,
    marginTop: 20,
    color: '#555',
  },
  infoText: {
    fontSize: 16,
    color: '#777',
    marginBottom: 10,
  },
  signOutButton: {
    marginTop: 40,
    marginHorizontal: 20,
    padding: 15,
    backgroundColor: '#E74C3C',
    borderRadius: 5,
    alignItems: 'center',
  },
  signOutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Profile;
