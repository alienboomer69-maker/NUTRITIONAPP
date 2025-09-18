import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  FlatList,
  Alert,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import foodDatabase from "./assets/foodDatabase.json";





// WHO & CDC Guidelines
const GUIDELINES = {
  calories: { min: 1800, max: 2400 },
  protein: { min: 50, max: 70 },
  carbs: { min: 225, max: 325 },
  fats: { min: 44, max: 78 },
};

// Food recommendation database

export default function RecommendationModule() {
  const [loading, setLoading] = useState(true);
  const [underConsumed, setUnderConsumed] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [consumedRecs, setConsumedRecs] = useState({});

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const savedFoods = await AsyncStorage.getItem("selectedFoods");
        const meals = savedFoods ? JSON.parse(savedFoods) : [];

        const savedRecs = await AsyncStorage.getItem("consumedRecommendations");
        const consumed = savedRecs ? JSON.parse(savedRecs) : {};
        setConsumedRecs(consumed);

        // Aggregate last 7 days intake
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        let totals = { calories: 0, protein: 0, carbs: 0, fats: 0 };
        let count = 0;

        meals.forEach((meal) => {
          const ts = new Date(meal.timestamp);
          if (ts >= sevenDaysAgo) {
            totals.calories += meal.calories || 0;
            totals.protein += meal.protein || 0;
            totals.carbs += meal.carbs || 0;
            totals.fats += meal.fats || 0;
            count++;
          }
        });

        const averages = {
          calories: count ? totals.calories / count : 0,
          protein: count ? totals.protein / count : 0,
          carbs: count ? totals.carbs / count : 0,
          fats: count ? totals.fats / count : 0,
        };

        let deficiencies = [];
        if (averages.calories < GUIDELINES.calories.min) deficiencies.push("calories");
        if (averages.protein < GUIDELINES.protein.min) deficiencies.push("protein");
        if (averages.carbs < GUIDELINES.carbs.min) deficiencies.push("carbs");
        if (averages.fats < GUIDELINES.fats.min) deficiencies.push("fats");

        setUnderConsumed(deficiencies);

        // Score foods
        const scoredFoods = foodDatabase.map((food) => {
          let score = 0;
          deficiencies.forEach((nutrient) => {
            if (food.helps.includes(nutrient)) {
              score += 1;
              score += food.nutrients[nutrient] || 0;
            }
          });

          if (consumed[food.id]) {
            score += consumed[food.id] * 2;
          }

          return { ...food, score };
        });

        const suggestedFoods = scoredFoods
          .filter((f) => f.score > 0)
          .sort((a, b) => b.score - a.score);

        setRecommendations(suggestedFoods);
      } catch (e) {
        console.error("Error loading recommendations:", e);
        Alert.alert("Error", "Could not fetch recommendations.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  const handleAcceptRecommendation = async (food) => {
    try {
      const updated = { ...consumedRecs, [food.id]: (consumedRecs[food.id] || 0) + 1 };
      setConsumedRecs(updated);
      await AsyncStorage.setItem("consumedRecommendations", JSON.stringify(updated));

      const savedFoods = await AsyncStorage.getItem("selectedFoods");
      const meals = savedFoods ? JSON.parse(savedFoods) : [];

      const newMeal = {
        id: Date.now().toString(),
        name: food.name,
        calories: food.nutrients.calories,
        protein: food.nutrients.protein,
        carbs: food.nutrients.carbs,
        fats: food.nutrients.fats,
        timestamp: new Date().toISOString(),
      };

      const updatedMeals = [...meals, newMeal];
      await AsyncStorage.setItem("selectedFoods", JSON.stringify(updatedMeals));

      Alert.alert("✅ Added", `${food.name} logged into your meals!`);
    } catch (e) {
      console.error("Error saving recommendation:", e);
      Alert.alert("Error", "Could not save this food.");
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Icon name="food-apple" size={22} color="#4CAF50" />
        <Text style={styles.foodName}>{item.name}</Text>
      </View>
      <Text style={styles.cardNutrients}>
        Protein: {item.nutrients.protein}g | Carbs: {item.nutrients.carbs}g | Fats: {item.nutrients.fats}g | {item.nutrients.calories} kcal
      </Text>
      {consumedRecs[item.id] && (
        <Text style={styles.history}>⭐ Picked {consumedRecs[item.id]} times</Text>
      )}

      {/* Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.viewButton} onPress={() => Alert.alert("Details", `${item.name}\n\nThis food helps with: ${item.helps.join(", ")}`)}>
          <Text style={styles.viewButtonText}>View Details</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.addButton} onPress={() => handleAcceptRecommendation(item)}>
          <Text style={styles.addButtonText}>Add to Log</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>💡 Recommendations</Text>
      <Text style={styles.subtitle}>
        Based on your last 7 days, you may need more:{" "}
        {underConsumed.length > 0 ? underConsumed.join(", ") : "You're on track!"}
      </Text>

      <FlatList
        data={recommendations}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.noData}>No recommendations right now.</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0F2F5", padding: 20 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold", color: "#333", marginBottom: 10 },
  subtitle: { fontSize: 16, color: "#666", marginBottom: 15 },
  list: { paddingBottom: 20 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  foodName: { fontSize: 18, fontWeight: "600", marginLeft: 8, color: "#333" },
  cardNutrients: { fontSize: 14, color: "#555" },
  history: { marginTop: 5, fontSize: 12, color: "#4CAF50", fontWeight: "600" },
  noData: { textAlign: "center", marginTop: 30, color: "#777" },

  buttonRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  viewButton: { padding: 10, backgroundColor: "#ddd", borderRadius: 5, flex: 1, marginRight: 8, alignItems: "center" },
  viewButtonText: { color: "#333", fontWeight: "600" },
  addButton: { padding: 10, backgroundColor: "#4CAF50", borderRadius: 5, flex: 1, alignItems: "center" },
  addButtonText: { color: "#fff", fontWeight: "600" },
});
