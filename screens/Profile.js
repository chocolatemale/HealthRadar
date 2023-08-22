import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { getUserRepo } from '../repos/UserRepo';
import { auth } from '../firebase';
import { useNavigation } from '@react-navigation/native';

const Profile = () => {
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

  const handleSignOut = () => {
    auth.signOut();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image 
          source={{ uri: user.photoURL || 'https://via.placeholder.com/150' }} 
          style={styles.profileImage}
        />
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
