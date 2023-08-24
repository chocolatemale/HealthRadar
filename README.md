# HealthRadar - A Health App
## [Link to Demo](https://www.youtube.com/watch?v=CIyfqncPND0)

## Authors: Wenzheng Liao, Yi Zheng
This application allows users to track their food and calorie intake, set a weight goal and monitor their weight trend, and check for food nutrition details from the world's best nutrition information API.

## Functionalities in this Iteration:

- **Camera use:** Implemented. Users can take a picture or select one from their media library.
- **Location use:** Implemented. Users can capture their current location and add to a food entry.
- **Authentication:** Implemented in this iteration. Firebase Authentication.
- **Notification:** Implemented in this iteration. The App will push local notification to remind user to log their weight and food data.
- **External API use:** Implemented in this iteration. Nutritionix API to fetch food and food details.

## Getting Started:

1. Clone the repository.
2. Install the required packages using the `npm install` or `yarn install` command.
3. Run the app using the appropriate command for your platform (e.g., `react-native run-ios` or `react-native run-android`).

## Key Features:
This repository contains several React Native components that together make up a mobile application. Each component serves a specific purpose and contributes to the overall functionality of the app. Below is a brief overview of each component:

### 1. `AddCaloriesEntry`
This component enables users to add and edit entries related to calories consumption. It includes functionalities such as image handling, location capture, date selection, and calorie input.

### 2. `FoodDetails`
The `FoodDetails` component displays detailed nutritional information about a specific food item. It communicates with an external API to fetch and present relevant data to the user.

### 3. `FoodOverview`
`FoodOverview` is a core component that allows users to search for food items, view nutritional information, and access different sections of the app. It integrates external APIs and Firebase to provide a seamless user experience.

### 4. `HomePage`
The `HomePage` component serves as the main dashboard of the application. It presents user-related data, progress tracking, and quick access to various app sections through navigation buttons.

### 5. `LoginPage`
This component handles user authentication and registration. Users can log in or register using an email and password, with features for password reset and UI adjustments for each mode.

### 6. `Profile`
The `Profile` component lets users view and update their profile information and image. It integrates Firebase for authentication, storage, and database operations, allowing users to customize their profiles.

### 7. `ViewCaloriesRecord`
Users can view and interact with their food entries in this component. It includes features like date selection, image modal display, and interaction with external services like maps and API data.

### 8. `WeightScreen`
`WeightScreen` facilitates weight management for users. It includes functionalities for setting weight targets, recording weights, and visualizing trends using charts. The component integrates Firebase Firestore for data storage.

## Libraries & Dependencies:

- `react-native`
- `@react-native-community/datetimepicker`
- `react-native-maps`
- `expo-location`
- `@fortawesome/react-native-fontawesome`
- `expo-image-picker`

## Future Enhancements:

- Implement notifications to remind users to add their meals and record their weights.
- Integrate Nutrition and Daily screen to allow user direct get food calories from Nutritionix API when recording their food entries.

## Feedback:
If you have any feedback or issues, please open a GitHub issue or submit a pull request. We appreciate your contributions!