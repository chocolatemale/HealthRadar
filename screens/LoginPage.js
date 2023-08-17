import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from "react-native";
import { getUserRepo } from "../repos/UserRepo";

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

const LoginPage = ({ setUserId }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);

  const handleLoginOrRegister = async () => {
      const userRepo = getUserRepo();
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

          const newUser = await userRepo.signin(email, password, password);
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
  };

  return (
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
              <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm Password"
                  secureTextEntry={true}
              />
          )}
          <TouchableOpacity style={styles.buttonContainer} onPress={handleLoginOrRegister}>
              <Text style={styles.buttonText}>{isLogin ? "Login" : "Register"}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
              <Text style={styles.switchModeText}>
                  {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
              </Text>
          </TouchableOpacity>
      </View>
  );
};

export default LoginPage;