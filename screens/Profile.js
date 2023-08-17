import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { getUserRepo } from '../repos/UserRepo';
import { auth } from '../firebase';
import { useNavigation } from '@react-navigation/native';

const Profile = ({  }) => {
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
    // No need to navigate to 'Login'. It will be handled by App.js's onAuthStateChanged listener.
  };
  
  return (
    <View style={styles.container}>
      {/* Profile Image - using a placeholder for now */}
      <Image 
        source={{ uri: 'https://via.placeholder.com/100' }} 
        style={styles.profileImage}
      />
      <Text style={styles.profileName}>Name: {user.username || "Unknown"}</Text>
      <Text style={styles.emailText}>Email: {user.email || "Unknown"}</Text>
      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutButtonText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f4f4',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  emailText: {
    fontSize: 18,
    marginVertical: 5,
    color: '#666',
  },
  signOutButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#3498db',
    borderRadius: 5,
  },
  signOutButtonText: {
    color: '#fff',
    fontSize: 18,
  },
});

export default Profile;
