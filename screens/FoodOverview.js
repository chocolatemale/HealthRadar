import React, { useState } from 'react';
import { View, FlatList, TextInput, TouchableOpacity, Text, Image, StyleSheet } from 'react-native';
import { searchFoods } from '../api/Nutritionix';

const FoodOverview = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [foods, setFoods] = useState([]);

  const handleSearch = async () => {
    const results = await searchFoods(searchQuery);
        if (results) {
            let prioritizedResults = [];

            // Check and add generic food items first
            if (results.common) {
                prioritizedResults = [...results.common];
            }

            // Append branded items
            if (results.branded) {
                prioritizedResults = [...prioritizedResults, ...results.branded];
            }

            setFoods(prioritizedResults);
        } else {
            console.error("Unexpected API response format:", results);
            setFoods([]);
        }
    };


    const renderFoodItem = ({ item }) => {      
        // Determine the identifier and type for the item.
        const itemId = item.nix_item_id || item.tag_id;
        const itemType = item.nix_item_id ? 'branded' : 'common';
      
        if (!itemId && !item.food_name) { // Check for both itemId and food_name
          console.warn("Item does not have an identifier or food name:", item);
          return null; // Return null to prevent rendering this item.
        }
      
        return (
          <TouchableOpacity 
            style={styles.listItem}
            onPress={() => {
              navigation.navigate('FoodDetails', { 
                foodId: itemId, 
                type: itemType, 
                foodName: item.food_name // Pass the food name
              });
            }}
          >
            <Image
              source={{ uri: item.photo && item.photo.thumb ? item.photo.thumb : 'default_thumbnail_url' }}
              style={styles.foodImage}
            />
            <View style={styles.foodDetails}>
              <Text style={styles.foodName}>{item.food_name}</Text>
              <Text style={styles.foodBrand}>{item.brand_name || 'Raw food'}</Text>
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
