import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { getFirebaseRepo } from "./repos/FirebaseRepo";
import { getUserRepo } from "./repos/UserRepo";

const test = async () => {
  const foodRepo = getFirebaseRepo("food", "mockUser");

  await foodRepo.addObject({ name: "Crepe", calories: 600 });
  await foodRepo.addObject({ name: "Diet Coke", calories: 0 });
  await foodRepo.addObject({ name: "Chicken Breast", calories: 300 });

  console.log(await foodRepo.getAllObjects());

  const foodRepo2 = getUserRepo();

  await foodRepo2.signin(
    "email",
    "password",
    "password",
    "1231231234",
    "username"
  );
  console.log(await foodRepo2.login("email", "password"));
};

test().then();

export default function App() {
  return (
    <View style={styles.container}>
      <Text>Open up App.js to start working on your app!</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
