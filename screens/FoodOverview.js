import React, { useState, useEffect } from 'react';
import { View, FlatList, TextInput, TouchableOpacity, Text, Image, StyleSheet, Button } from 'react-native';
import { searchFoods } from '../api/Nutritionix';
import { getVisitedFoodRepo } from '../repos/FirebaseRepo';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';

const FoodOverview = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [foods, setFoods] = useState([]);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (userId) {
      const fetchVisitedFoods = async () => {
        const visitedFoodRepo = getVisitedFoodRepo(userId);
        const visitedFoods = await visitedFoodRepo.getVisitedFoods();
        setFoods(visitedFoods);
      };
      fetchVisitedFoods();
    }
  }, [userId]);

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

  const handleClearSearch = () => {
    setSearchQuery('');
    // Load the visited foods for the user
    const fetchVisitedFoods = async () => {
      const visitedFoodRepo = getVisitedFoodRepo(userId);
      const visitedFoods = await visitedFoodRepo.getVisitedFoods();
      setFoods(visitedFoods);
    };
    fetchVisitedFoods();
  };

  const handleClearVisitedFoods = async () => {
    const visitedFoodRepo = getVisitedFoodRepo(userId);
    await visitedFoodRepo.clearVisitedFoods();
    setFoods([]);  // Clear displayed foods after clearing history
  };

  const handleFoodClick = async (itemId, itemType, foodName) => {
    const visitedFoodRepo = getVisitedFoodRepo(userId);
    await visitedFoodRepo.addVisitedFood({ nix_item_id: itemId, type: itemType, food_name: foodName });
    navigation.navigate('FoodDetails', { foodId: itemId, type: itemType, foodName });
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
          handleFoodClick(itemId, itemType, item.food_name);
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
      <Button title="Clear Search" onPress={handleClearSearch} />
      <Button title="Clear Visited History" onPress={handleClearVisitedFoods} />
      <FlatList
        data={foods}
        keyExtractor={(item) => item.nix_item_id.toString()}
        renderItem={renderFoodItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f4f4f4'
  },
  searchBar: {
    padding: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: '#fff'
  },
  listItem: {
    flexDirection: 'row',
    padding: 15,
    marginVertical: 5,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 1
  },
  foodImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
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
