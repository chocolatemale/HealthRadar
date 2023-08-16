import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faPlus,
  faTrash,
  faCalendarAlt,
} from "@fortawesome/free-solid-svg-icons";
import { useIsFocused } from "@react-navigation/native";

const ViewCaloriesRecord = ({ navigation, foodRepo }) => {
  // Include the navigation prop
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [foodEntries, setFoodEntries] = useState([]);
  const [totalCalories, setTotalCalories] = useState(0);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      foodRepo.getAllObjects().then(setFoodEntries);
    }
  }, [foodRepo, isFocused]);

  useEffect(() => {
    setTotalCalories(
      foodEntries.reduce(
        (total, entry) => parseInt(total) + parseInt(entry.calories),
        0
      )
    );
  }, [foodEntries]);

  console.log("foodEntries", foodEntries);
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Calories Record</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("AddCaloriesEntry")} // Navigate to the AddCaloriesEntry screen
        >
          <FontAwesomeIcon icon={faPlus} size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* List of Food Entries */}
      <View style={styles.entriesContainer}>
        {/* Placeholder for food entries */}
        {foodEntries.size == 0 ? (
          <Text style={styles.placeholderText}>No food entries yet</Text>
        ) : (
          foodEntries.map((entry) => (
            <View key={entry.id}>
              <Text>{entry.name}</Text>
              <Text>{entry.calories}</Text>
            </View>
          ))
        )}
      </View>

      {/* Total Calories */}
      <View style={styles.toxtalContainer}>
        <Text style={styles.totalText}>Total Calories: {totalCalories}</Text>
        <TouchableOpacity
          style={styles.datePicker}
          onPress={() => console.log("Date Picker")}
        >
          <Text>{selectedDate.toDateString()}</Text>
          <FontAwesomeIcon icon={faCalendarAlt} size={20} color="black" />
        </TouchableOpacity>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f4f4",
    padding: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  addButton: {
    backgroundColor: "#3498db",
    padding: 10,
    borderRadius: 20,
  },
  entriesContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
  },
  entry: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingVertical: 10,
  },
  placeholderText: {
    textAlign: "center",
    color: "#999",
    fontSize: 16,
    paddingVertical: 20,
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
  },
  totalText: {
    fontWeight: "bold",
  },
  datePicker: {
    flexDirection: "row",
    alignItems: "center",
  },
});

export default ViewCaloriesRecord;
