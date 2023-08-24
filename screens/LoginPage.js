import React, { useState } from "react";
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity, Alert,
    KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback // <-- Add TouchableWithoutFeedback here
} from "react-native";
import { getUserRepo } from "../repos/UserRepo";

const LoginPage = ({ setUserId }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [username, setUsername] = useState("");  // New
    const [firstName, setFirstName] = useState("");  // New
    const [lastName, setLastName] = useState("");  // New
    const [phoneCode, setPhoneCode] = useState("");  // New
    const [phoneNumber, setPhoneNumber] = useState("");  // New
    const [isLogin, setIsLogin] = useState(true);
  
    const handleResetPassword = async () => {
        if (!email) {
            Alert.alert('Error', 'Please enter your email address.');
            return;
        }
    
        try {
            await getUserRepo().resetPassword(email);
            Alert.alert('Password Reset', 'A password reset link has been sent to your email.');
        } catch (error) {
            switch (error.code) {
                case 'auth/missing-email':
                    Alert.alert('Error', 'Please enter a valid email address.');
                    break;
                case 'auth/user-not-found':
                    Alert.alert('Error', 'There is no user associated with this email address.');
                    break;
                default:
                    Alert.alert('Error', 'An error occurred while resetting the password.');
                    break;
            }
        }
    };
    
    const handleLoginOrRegister = async () => {
        const userRepo = getUserRepo();
        try {  // You need to start with a try block.
            if (isLogin) {
                const userId = await userRepo.login(email, password);
                if (userId) {
                    setUserId(userId);
                } else {
                    alert("Incorrect login credentials or other error occurred.");
                }
            } else {
                if (password !== confirmPassword) {
                    alert("Passwords do not match.");
                    return;
                }
    
                const newUser = await userRepo.signin(email, password, password, username, firstName, lastName, phoneCode + phoneNumber);
                if (newUser) {
                    Alert.alert(
                        'Registration Successful',
                        'Welcome to HealthRadar!',
                        [
                            {
                                text: 'OK', onPress: () => setUserId(newUser.uid)
                            }
                        ]
                    );
                } else {
                    alert("Error during registration.");
                }
            }
        } catch (error) {  // This catch corresponds to the try block above.
            if (error.code === "auth/email-already-in-use") {
                alert("This email is already in use.");
            } else if (error.message === "Property 'username' doesn't exist") {
                alert("Username is required.");
            } else {
                alert("An unexpected error occurred. Please try again.");
            }
        }
    };
    
    const dismissKeyboard = () => {
        Keyboard.dismiss(); // This dismisses the keyboard
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20} // adjust the value here if needed
        >
            <TouchableWithoutFeedback onPress={dismissKeyboard}>
                <View style={styles.container}>
                    <Text style={styles.logo}>HealthRadar</Text>
                    <Text style={styles.welcomeMessage}>Welcome! Login or register to continue</Text>
                    <TextInput
                        style={styles.input}
                        value={email}
                        onChangeText={setEmail}
                        placeholder="Email"
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                    <TextInput
                        style={styles.input}
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Password"
                        secureTextEntry={true}
                    />
                    {!isLogin && (
                        <>
                            <TextInput
                            style={styles.input}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            placeholder="Confirm Password"
                            secureTextEntry={true}
                        />
                            <TextInput
                                style={styles.input}
                                value={username}
                                onChangeText={setUsername}
                                placeholder="Username"
                            />
                            <TextInput
                                style={styles.input}
                                value={firstName}
                                onChangeText={setFirstName}
                                placeholder="First Name"
                            />
                            <TextInput
                                style={styles.input}
                                value={lastName}
                                onChangeText={setLastName}
                                placeholder="Last Name"
                            />
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <TextInput
                                style={[styles.input, { flex: 1, marginRight: 5 }]}
                                value={phoneCode}
                                onChangeText={setPhoneCode}
                                placeholder="Code"
                                keyboardType="number-pad"
                            />
                            <TextInput
                                style={[styles.input, { flex: 3 }]}
                                value={phoneNumber}
                                onChangeText={setPhoneNumber}
                                placeholder="Phone Number"
                                keyboardType="number-pad"
                            />
                            </View>
                            </>
                        )}
                    <TouchableOpacity style={styles.buttonContainer} onPress={handleLoginOrRegister}>
                        <Text style={styles.buttonText}>{isLogin ? "Login" : "Register"}</Text>
                    </TouchableOpacity>
                    {isLogin && (
                        <TouchableOpacity onPress={handleResetPassword}>
                            <Text style={styles.switchModeText}>Forgot Password?</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
                        <Text style={styles.switchModeText}>
                            {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
                        </Text>
                    </TouchableOpacity>
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
  container: {
      flex: 1,
      justifyContent: "center",
      paddingHorizontal: 20,
      backgroundColor: "#f8f9fa",
  },
  logo: {
      fontSize: 40,
      fontWeight: "bold",
      color: "#3498db",
      textAlign: 'center',
  },
  welcomeMessage: {
      fontSize: 18,
      textAlign: 'center',
      marginBottom: 40,
      color: "#2c3e50",
      opacity: 0.8,
  },
  input: {
      height: 40,
      borderColor: "#dce4ef",
      borderWidth: 1,
      marginBottom: 20,
      padding: 10,
      borderRadius: 5,
      backgroundColor: 'white',
  },
  buttonContainer: {
      margin: 10,
      backgroundColor: "#3498db",
      borderRadius: 5,
      padding: 10,
      alignItems: 'center',
      justifyContent: 'center',
  },
  buttonText: {
      color: 'white',
      fontWeight: 'bold',
  },
  switchModeText: {
      textAlign: 'center',
      marginTop: 10,
  }
});

export default LoginPage;