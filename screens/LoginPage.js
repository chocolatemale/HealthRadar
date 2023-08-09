import React from "react";
import { View, Button, Text, StyleSheet } from "react-native";

const styles = StyleSheet.create({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100%",
});

const LoginPage = ({ navigation, setUserId }) => {
  return (
    <View style={styles}>
      <Text>LoginPage</Text>
      <Button
        title="Login"
        onPress={() => {
          setUserId("test");
        }}
      ></Button>
    </View>
  );
};

export default LoginPage;
