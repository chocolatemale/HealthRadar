import axios from 'axios';

const API_ENDPOINT = "https://trackapi.nutritionix.com/v2";
const APP_ID = "f6d81207";
const API_KEY = "5582dc4ba599c2e5676e147bf3c74ea0";

const client = axios.create({
  baseURL: API_ENDPOINT,
  headers: {
    "x-app-id": APP_ID,
    "x-app-key": API_KEY,
    "Content-Type": "application/json"
  },
});

export const searchFoods = async (query) => {
  try {
    const response = await client.get(`/search/instant`, {
      params: { query }
    });
    console.log('Search Foods Response:', response.data);
    return response.data;
  } catch (error) {
    console.error("Failed to search foods: ", error.response ? error.response.data : error.message);
    return null;
  }
};

export const getFoodDetails = async (identifier, type = 'common') => {
    let response;

    try {
        if (type === 'common') {
            response = await client.post(`/natural/nutrients`, { query: identifier }); // identifier is the food name for common foods
        } else { // for branded items
            response = await client.get(`/search/item`, {
                params: { nix_item_id: identifier }
            });
        }

        if (response.status === 404) {
            throw new Error('Food not found. Please try a different query.');
        } else if (response.status !== 200) {
            throw new Error(response.data.message || 'Failed to fetch food details');
        }

        console.log('Get Food Details Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching food details:', error.response ? error.response.data : error.message);
        throw error;
    }
};
