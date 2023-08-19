import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';
import { getFoodDetails } from '../api/Nutritionix';

const FoodDetails = ({ route }) => {
    const { foodId, type, foodName } = route.params;
    const [foodDetails, setFoodDetails] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const identifier = type === 'common' ? foodName : foodId;
                const data = await getFoodDetails(identifier, type);
                setFoodDetails(data.foods[0]);
                setError(null);
            } catch (err) {
                setError(err.message || "An error occurred!");
            }
        };
        fetchData();
    }, [foodId, type, foodName]);

    if (error) return <Text style={styles.errorText}>{error}</Text>;
    if (!foodDetails) return <Text style={styles.loadingText}>Loading...</Text>;

    const toTitleCase = str => str.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());

    return (
        <ScrollView style={styles.container}>
            {foodDetails.photo && foodDetails.photo.thumb && (
                <Image source={{ uri: foodDetails.photo.thumb }} style={styles.foodImage} />
            )}
            <Text style={styles.headerText}>{toTitleCase(foodDetails.food_name)}</Text>
            
            {foodDetails.brand_name && (
                <Text style={styles.brandText}>By {foodDetails.brand_name}</Text>
            )}

            <View style={styles.card}>
                <Text style={styles.detailsHeader}>Nutritional Information</Text>
                <Text style={styles.detailsText}>Calories: {foodDetails.nf_calories}</Text>
                <Text style={styles.detailsText}>Protein: {foodDetails.nf_protein}g</Text>
                <Text style={styles.detailsText}>Carbs: {foodDetails.nf_total_carbohydrate}g</Text>
                <Text style={styles.detailsText}>Sugars: {foodDetails.nf_sugars}g</Text>
                <Text style={styles.detailsText}>Dietary Fiber: {foodDetails.nf_dietary_fiber}g</Text>
                <Text style={styles.detailsText}>Saturated Fat: {foodDetails.nf_saturated_fat}g</Text>
                <Text style={styles.detailsText}>Total Fat: {foodDetails.nf_total_fat}g</Text>
                <Text style={styles.detailsText}>Cholesterol: {foodDetails.nf_cholesterol}mg</Text>
                <Text style={styles.detailsText}>Sodium: {foodDetails.nf_sodium}mg</Text>
                {foodDetails.nf_potassium && (
                    <Text style={styles.detailsText}>Potassium: {foodDetails.nf_potassium}mg</Text>
                )}
                <Text style={styles.detailsText}>Serving Size: {foodDetails.serving_qty} {foodDetails.serving_unit} ({foodDetails.serving_weight_grams}g)</Text>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5'
    },
    foodImage: {
        width: 200,
        height: 200,
        borderRadius: 10,
        alignSelf: 'center',
        marginVertical: 20,
        borderColor: '#ddd',
        borderWidth: 2
    },
    headerText: {
        fontSize: 26,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#333'
    },
    brandText: {
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
        color: '#666',
        marginTop: 5,
        marginBottom: 20
    },
    card: {
        backgroundColor: '#fff',
        marginHorizontal: 15,
        marginVertical: 10,
        padding: 15,
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    detailsHeader: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 10,
        color: '#444'
    },
    detailsText: {
        fontSize: 16,
        marginVertical: 3,
        color: '#555'
    },
    errorText: {
        textAlign: 'center',
        color: 'red',
        marginVertical: 15,
        fontSize: 18
    },
    loadingText: {
        textAlign: 'center',
        color: '#888',
        marginVertical: 15,
        fontSize: 18
    }
});

export default FoodDetails;
