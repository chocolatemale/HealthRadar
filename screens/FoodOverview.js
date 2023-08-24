import React, { useState, useEffect } from 'react';
import { View, FlatList, TextInput, TouchableOpacity, Text, Image, Button, StyleSheet, Alert } from 'react-native';
import { searchFoods } from '../api/Nutritionix';
import { getFirebaseRepo } from "../repos/FirebaseRepo";
import { auth } from "../firebase"; // Assuming this is how you've set up Firebase auth in your app.
import { getFoodDetails
 } from '../api/Nutritionix';
 
const FoodOverview = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [foods, setFoods] = useState([]);
  const [visitedHistory, setVisitedHistory] = useState([]);

  const storeVisit = async (foodId, type, foodName) => {
    const userId = auth.currentUser.uid;
    const timestamp = new Date().toISOString();
    const identifier = type === 'common' ? simplifyName(foodName) : foodId; // Use foodName for common and foodId for branded.
  
    const visitRepo = getFirebaseRepo("visitedFoods", userId);
  
    // Check if an entry with the same name/ID exists.
    const existingRecords = await visitRepo.getAllObjects();
    const existingRecord = existingRecords.find(
      r => r.foodId === identifier && r.type === type
    );
  
    if (existingRecord) {
      // If the record exists, delete the oldest record.
      existingRecords.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      await visitRepo.removeObject(existingRecords[0].id);
    }
  
    // Now, add the new entry.
    await visitRepo.addVisitedRecord({ foodId: identifier, type, timestamp });
  };
  
  useEffect(() => {
    // Fetch visited history as soon as the component mounts.
    fetchVisitedHistory();
  }, []);
  
  const fetchVisitedHistory = async () => {
    const userId = auth.currentUser.uid;
    const visitRepo = getFirebaseRepo("visitedFoods", userId);
    const history = await visitRepo.getAllObjects();

    // Sort the history records based on the timestamp in descending order
    history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    const detailedVisitedHistory = [];
  
    let count = 0; // Keep track of the number of valid records fetched
    for (const record of history) {
      if (count >= 7) break; // Fetch only the 10 latest records
      
      try {
        const foodDetails = await getFoodDetails(record.foodId, record.type);
        if (foodDetails && foodDetails.foods && foodDetails.foods[0] && foodDetails.foods[0].nf_calories !== "N/A") {
          detailedVisitedHistory.push(foodDetails.foods[0]);
          count++;
        }
      } catch (error) {
        if (error.message && error.message.includes("We couldn't match any of your foods")) {
          console.warn("Error fetching details for visited food:", record.foodId, error);
          continue; // Skip and move to the next one
        } else {
          console.error("Unknown error occurred:", error);
        }
      }
    }
  
    setVisitedHistory(detailedVisitedHistory);
  };

  const clearVisitedHistory = async () => {
    Alert.alert(
      "Clear History",
      "Are you sure you want to clear your visited history?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes",
          onPress: async () => {
            const userId = auth.currentUser.uid;
            const visitRepo = getFirebaseRepo("visitedFoods", userId);
            await visitRepo.clearVisitedRecords();
            setVisitedHistory([]); // Clear local state.
            // Reload the visited history after clearing
            fetchVisitedHistory();
          }
        }
      ]
    );
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
    
        // Check if this name already exists in our list.
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
    const itemId = item.nix_item_id || item.food_name;
    const itemType = item.nix_item_id ? 'branded' : 'common';

    if (!itemId && !item.food_name) { 
      console.warn("Item does not have an identifier or food name:", item);
      return null; 
    }

    return (
      <TouchableOpacity 
          style={[styles.listItem, styles.card]}
          onPress={() => {
              storeVisit(itemId, itemType, item.food_name); 
              navigation.navigate('FoodDetails', { foodId: itemId, type: itemType, foodName: item.food_name });
          }}
      >
          <Image
              source={{ uri: item.photo && item.photo.thumb ? item.photo.thumb : 'default_thumbnail_url' }}
              style={styles.foodImage}
          />
          <View style={styles.foodDetails}>
              <Text style={styles.foodName}>{capitalize(item.food_name)}</Text>
              <Text style={styles.foodBrand}>{item.brand_name || 'Common Food'}</Text>
          </View>
          <View style={styles.caloriesContainer}>
              <Text style={[styles.caloriesText, item.nf_calories > 200 ? styles.caloriesRed : styles.caloriesGreen]}>
                  {item.nf_calories ? `${Math.round(item.nf_calories)} cal` : 'Click to view'}
              </Text>
              <Text style={styles.servingSizeText}>
                  {item.serving_qty ? item.serving_qty : 'N/A'} {item.serving_unit ? item.serving_unit : ''}
              </Text>
          </View>
      </TouchableOpacity>
      );
    };

  return (
    <View style={styles.container}>
      <View style={styles.searchBarContainer}>
        <TextInput
          style={styles.searchBar}
          placeholder="Search for all foods..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          onEndEditing={handleSearch}
        />
        {foods.length > 0 && (
          <TouchableOpacity style={styles.clearSearchButton} onPress={() => { 
              setFoods([]); 
              setSearchQuery(''); 
              // Reload the visited history after clearing the search
              fetchVisitedHistory();
              }}>
              <Text style={styles.clearSearchButtonText}>Clear Search</Text>
          </TouchableOpacity>
        )}
      </View>

      {foods.length > 0 ? (
        <FlatList
          data={foods}
          keyExtractor={(item) => item.nix_item_id ? item.nix_item_id.toString() : item.food_name}
          renderItem={renderFoodItem}
        />
      ) : (
        <View>
          <View style={styles.historyHeader}>
            <Text style={styles.historyHeaderText}>Recently Viewed:</Text>
            {visitedHistory.length > 0 && (
              <TouchableOpacity onPress={clearVisitedHistory}>
                <Text style={styles.clearHistoryText}>Clear History</Text>
              </TouchableOpacity>
            )}
          </View>

          <FlatList
            data={visitedHistory}
            keyExtractor={(item) => item.nix_item_id ? item.nix_item_id.toString() : item.food_name}
            renderItem={renderFoodItem}
          />
        </View>
      )}
    </View>
  );  
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10
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
    borderRadius: 10,
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
  },
    caloriesContainer: {
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'flex-end',
    flex: 1
  },
  caloriesText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  caloriesRed: {
    color: 'red'
  },
  caloriesGreen: {
    color: 'green'
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  searchBar: {
    flex: 1,
    padding: 15,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: '#fff'
  },
  clearSearchButton: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#FF6347', // Tomato color
    marginLeft: 10
  },
  clearSearchButtonText: {
    color: '#FFF',
    fontSize: 16
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  historyHeaderText: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  clearHistoryText: {
    color: '#FF6347',
    fontSize: 16,
    textDecorationLine: 'underline'
  },
  card: {
    flexDirection: 'row',
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,  // Reduced y-offset
    },
    shadowOpacity: 0.15,  // Reduced opacity
    shadowRadius: 2,  // Reduced blur radius
    elevation: 3  // Reduced elevation for Android
  },
  servingSizeText: {
    fontSize: 13,
    color: 'gray',
    marginTop: 4  // add some margin to space it out from the calories
  },  
});

export default FoodOverview;