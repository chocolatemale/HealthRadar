import React, { useState, useEffect } from 'react';
import { View, FlatList, TextInput, TouchableOpacity, Text, Image, Button, StyleSheet } from 'react-native';
import { searchFoods } from '../api/Nutritionix';
import { getFirebaseRepo } from "../repos/FirebaseRepo";
import { auth } from "../firebase"; // Assuming this is how you've set up Firebase auth in your app.

const FoodOverview = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [foods, setFoods] = useState([]);
  const [visitedHistory, setVisitedHistory] = useState([]);

  const storeVisit = async (foodId, type) => {
    const userId = auth.currentUser.uid;
    const timestamp = new Date().toISOString();

    const visitRepo = getFirebaseRepo("visitedFoods", userId);
    await visitRepo.addVisitedRecord({ foodId, type, timestamp });
  };

  const fetchVisitedHistory = async () => {
    const userId = auth.currentUser.uid;
    const visitRepo = getFirebaseRepo("visitedFoods", userId);
    const history = await visitRepo.getAllObjects();
    setVisitedHistory(history);
  };

  const clearVisitedHistory = async () => {
    const userId = auth.currentUser.uid;
    const visitRepo = getFirebaseRepo("visitedFoods", userId);
    await visitRepo.clearVisitedRecords();
    setVisitedHistory([]); // Clear local state.
  };

  const simplifyName = name => {
    return name.toLowerCase().replace(/\s+/g, " ").replace(/s\b|\bon\b|s\b/g, "").trim();
  };

  const capitalize = name => {
    return name.replace(/\b\w/g, char => char.toUpperCase());
  };

  const handleSearch = async () => {
    const results = await searchFoods(searchQuery);

    if (results) {
      let processedResults = [];

      // Process common items
      const commonItems = results.common || [];
      const uniqueCommonItems = [];
      const seenCommonNames = new Set();

      for (const item of commonItems) {
        const simplifiedName = simplifyName(item.food_name);

        if (!seenCommonNames.has(simplifiedName)) {
          seenCommonNames.add(simplifiedName);
          uniqueCommonItems.push({ ...item, food_name: capitalize(simplifiedName) });
        }
      }

      processedResults = [...uniqueCommonItems];

      // Append branded items
      if (results.branded) {
        processedResults = [...processedResults, ...results.branded];
      }

      // Prioritize by similarity to search query
      processedResults.sort((a, b) => {
        const aSimilarity = a.food_name.includes(searchQuery) ? 1 : 0;
        const bSimilarity = b.food_name.includes(searchQuery) ? 1 : 0;

        return bSimilarity - aSimilarity;
      });

      setFoods(processedResults);
    } else {
      console.error("Unexpected API response format:", results);
      setFoods([]);
    }
  };

  const renderFoodItem = ({ item }) => {
    // Determine the identifier and type for the item.
    const itemId = item.nix_item_id || item.tag_id;
    const itemType = item.nix_item_id ? 'branded' : 'common';
    
    if (!itemId && !item.food_name) { 
      console.warn("Item does not have an identifier or food name:", item);
      return null; 
    }

    return (
      <TouchableOpacity 
        style={styles.listItem}
        onPress={() => {
          storeVisit(itemId, itemType);
          navigation.navigate('FoodDetails', { foodId: itemId, type: itemType, foodName: item.food_name });
        }}
      >
        <Image
          source={{ uri: item.photo && item.photo.thumb ? item.photo.thumb : 'default_thumbnail_url' }}
          style={styles.foodImage}
        />
        <View style={styles.foodDetails}>
          <Text style={styles.foodName}>{item.food_name}</Text>
          <Text style={styles.foodBrand}>{item.brand_name || 'Common Food'}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Search for food..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        onEndEditing={handleSearch}
      />
      <FlatList
        data={foods}
        keyExtractor={(item) => item.nix_item_id ? item.nix_item_id.toString() : item.food_name}
        renderItem={renderFoodItem}
      />
      <Button title="View Visited History" onPress={fetchVisitedHistory} />
      {visitedHistory.length > 0 && <Button title="Clear Visited History" onPress={clearVisitedHistory} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10
  },
  searchBar: {
    padding: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10
  },
  listItem: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    alignItems: 'center'
  },
  foodImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10
  },
  foodDetails: {
    flex: 1
  },
  foodName: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  foodBrand: {
    fontSize: 14,
    color: 'gray'
  }
});

export default FoodOverview;