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

/* ------------------ Nutrition Guidelines ------------------ */
const GUIDELINES = {
  calories: { min: 1800 },
  protein: { min: 50 },
  carbs: { min: 225 },
  fats: { min: 44 },
};

/* ------------------ Utility helpers ------------------ */
const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));

export default function RecommendationModule() {
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const [deficits, setDeficits] = useState({});
  const [history, setHistory] = useState({});

  useEffect(() => {
    buildRecommendations();
  }, []);

  /* ------------------ CORE ML-STYLE ENGINE ------------------ */
  const buildRecommendations = async () => {
    try {
      const mealsRaw = await AsyncStorage.getItem("selectedFoods");
      const historyRaw = await AsyncStorage.getItem("consumedRecommendations");

      const meals = mealsRaw ? JSON.parse(mealsRaw) : [];
      const pastChoices = historyRaw ? JSON.parse(historyRaw) : {};
      setHistory(pastChoices);

      /* ---- 1️⃣ Time-weighted nutrition intake (last 7 days) ---- */
      const now = Date.now();
      let totals = { calories: 0, protein: 0, carbs: 0, fats: 0 };
      let weightSum = 0;

      meals.forEach((m) => {
        if (!m.timestamp) return;
        const daysAgo = (now - new Date(m.timestamp).getTime()) / 86400000;
        if (daysAgo > 7) return;

        const weight = clamp(1 - daysAgo / 7);
        weightSum += weight;

        totals.calories += (m.calories || 0) * weight;
        totals.protein += (m.protein || 0) * weight;
        totals.carbs += (m.carbs || 0) * weight;
        totals.fats += (m.fats || 0) * weight;
      });

      if (weightSum > 0) {
        Object.keys(totals).forEach(
          (k) => (totals[k] = totals[k] / weightSum)
        );
      }

      /* ---- 2️⃣ Nutrition deficits vector ---- */
      const deficitVector = {
        calories: clamp(
          (GUIDELINES.calories.min - totals.calories) /
            GUIDELINES.calories.min
        ),
        protein: clamp(
          (GUIDELINES.protein.min - totals.protein) /
            GUIDELINES.protein.min
        ),
        carbs: clamp(
          (GUIDELINES.carbs.min - totals.carbs) /
            GUIDELINES.carbs.min
        ),
        fats: clamp(
          (GUIDELINES.fats.min - totals.fats) / GUIDELINES.fats.min
        ),
      };

      setDeficits(deficitVector);

      /* ---- 3️⃣ Score foods (feature dot-product) ---- */
      const scored = foodDatabase.map((food) => {
        const nutrients = food.nutrients;

        // Feature vector
        const nutritionScore =
          nutrients.calories * deficitVector.calories * 0.3 +
          nutrients.protein * deficitVector.protein * 0.4 +
          nutrients.carbs * deficitVector.carbs * 0.2 +
          nutrients.fats * deficitVector.fats * 0.1;

        // Reinforcement learning (user preference)
        const preferenceBoost = (pastChoices[food.id] || 0) * 0.6;

        // Diversity penalty
        const diversityPenalty = Math.min(pastChoices[food.id] || 0, 3) * 0.5;

        const finalScore =
          nutritionScore + preferenceBoost - diversityPenalty;

        return {
          ...food,
          score: Number(finalScore.toFixed(2)),
          reason: explain(food, deficitVector),
        };
      });

      /* ---- 4️⃣ Sort + filter ---- */
      const result = scored
        .filter((f) => f.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 20);

      setRecommendations(result);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to generate recommendations");
    } finally {
      setLoading(false);
    }
  };

  /* ------------------ Explanation Engine ------------------ */
  const explain = (food, deficits) => {
    const reasons = [];
    if (deficits.protein > 0.2 && food.nutrients.protein > 5)
      reasons.push("High protein");
    if (deficits.carbs > 0.2 && food.nutrients.carbs > 20)
      reasons.push("Good energy source");
    if (deficits.fats > 0.2 && food.nutrients.fats > 8)
      reasons.push("Healthy fats");
    if (deficits.calories > 0.2 && food.nutrients.calories > 150)
      reasons.push("Boosts calories");

    return reasons.length ? reasons.join(", ") : "Balanced nutrition";
  };

  /* ------------------ Accept Recommendation ------------------ */
  const acceptFood = async (food) => {
    try {
      const updatedHistory = {
        ...history,
        [food.id]: (history[food.id] || 0) + 1,
      };
      setHistory(updatedHistory);
      await AsyncStorage.setItem(
        "consumedRecommendations",
        JSON.stringify(updatedHistory)
      );

      const mealsRaw = await AsyncStorage.getItem("selectedFoods");
      const meals = mealsRaw ? JSON.parse(mealsRaw) : [];

      meals.push({
        id: Date.now().toString(),
        name: food.name,
        calories: food.nutrients.calories,
        protein: food.nutrients.protein,
        carbs: food.nutrients.carbs,
        fats: food.nutrients.fats,
        timestamp: new Date().toISOString(),
      });

      await AsyncStorage.setItem("selectedFoods", JSON.stringify(meals));
      Alert.alert("Added", `${food.name} added to meal log`);
    } catch {
      Alert.alert("Error", "Failed to save food");
    }
  };

  /* ------------------ UI ------------------ */
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>🤖 Smart Food Recommendations</Text>

      <Text style={styles.subtitle}>
        Optimized using your nutrition gaps & eating behavior
      </Text>

      <FlatList
        data={recommendations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.food}>{item.name}</Text>
            <Text style={styles.nutrients}>
              {item.nutrients.calories} kcal • P {item.nutrients.protein}g • C{" "}
              {item.nutrients.carbs}g • F {item.nutrients.fats}g
            </Text>
            <Text style={styles.reason}>Why: {item.reason}</Text>

            <View style={styles.row}>
              <Text style={styles.score}>Score: {item.score}</Text>
              <TouchableOpacity
                style={styles.add}
                onPress={() => acceptFood(item)}
              >
                <Text style={styles.addText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>You're nutritionally balanced 👍</Text>
        }
      />
    </SafeAreaView>
  );
}

/* ------------------ Styles ------------------ */
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#F4F6F8" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 6 },
  subtitle: { color: "#666", marginBottom: 16 },
  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },
  food: { fontSize: 18, fontWeight: "600" },
  nutrients: { color: "#555", marginTop: 4 },
  reason: { marginTop: 6, color: "#4CAF50", fontWeight: "600" },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    alignItems: "center",
  },
  score: { color: "#333" },
  add: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addText: { color: "#fff", fontWeight: "600" },
  empty: { textAlign: "center", marginTop: 40, color: "#777" },
});
