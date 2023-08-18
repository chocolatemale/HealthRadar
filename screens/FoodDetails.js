import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { getFoodDetails } from '../api/Nutritionix';

const FoodDetails = ({ route }) => {
    const { foodId, type, foodName } = route.params;
    const [foodDetails, setFoodDetails] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // If it's a common food, use foodName. Otherwise, use foodId.
                const identifier = type === 'common' ? foodName : foodId;
                const data = await getFoodDetails(identifier, type);
                setFoodDetails(data.foods[0]);
                setError(null); // reset error state if the call is successful
            } catch (err) {
                setError(err.message || "An error occurred!");
            }
        };
        fetchData();
    }, [foodId, type, foodName]);

    if (error) return <Text>{error}</Text>;
    if (!foodDetails) return <Text>Loading...</Text>;

    return (
        <View style={styles.container}>
            {foodDetails.photo && foodDetails.photo.thumb && (
                <Image source={{ uri: foodDetails.photo.thumb }} style={styles.foodImage} />
            )}
            <Text style={styles.headerText}>{foodDetails.food_name}</Text>
            <Text>Calories: {foodDetails.nf_calories}</Text>
            <Text>Protein: {foodDetails.nf_protein}g</Text>
            <Text>Carbs: {foodDetails.nf_total_carbohydrate}g</Text>
            <Text>Serving Size: {foodDetails.serving_qty} {foodDetails.serving_unit}</Text>
            {/* ... Add more details as needed */}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20
    },
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20
    },
    foodImage: {
        width: 150,
        height: 150,
        borderRadius: 75,
        alignSelf: 'center',
        marginBottom: 20
    }
});

export default FoodDetails;
