import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Progress from "react-native-progress";

const { width } = Dimensions.get("window");

// 🔹 Mini component for Progress Bar
const ProgressItem = ({ label, value, goal, unit }) => {
  const progress = goal > 0 ? Math.min(value / goal, 1) : 0;
  return (
    <View style={styles.progressContainer}>
      <Text style={styles.progressLabel}>
        {label}: {value}
        {unit}/{goal}
        {unit}
      </Text>
      <Progress.Bar
        progress={progress}
        width={width * 0.8}
        height={12}
        color="#6200EE"
        unfilledColor="#ddd"
        borderWidth={0}
        borderRadius={6}
      />
    </View>
  );
};

const GoalManagementScreen = () => {
  const [goals, setGoals] = useState({
    calorieGoal: "",
    proteinGoal: "",
    carbsGoal: "",
    fatsGoal: "",
    waterGoal: "",
  });

  const [dailyData, setDailyData] = useState({
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFats: 0,
    totalWater: 0,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 🔹 Load data with Promise.all
  useEffect(() => {
    const loadData = async () => {
      try {
        const [savedGoals, savedFoods, waterIntake] = await Promise.all([
          AsyncStorage.getItem("nutritionGoals"),
          AsyncStorage.getItem("selectedFoods"),
          AsyncStorage.getItem("waterIntake"),
        ]);

        if (savedGoals) setGoals(JSON.parse(savedGoals));

        const meals = savedFoods ? JSON.parse(savedFoods) : [];
        const today = new Date().toISOString().split("T")[0];

        let totals = {
          totalCalories: 0,
          totalProtein: 0,
          totalCarbs: 0,
          totalFats: 0,
        };

        meals.forEach((meal) => {
          const mealDate = meal.timestamp?.split("T")[0];
          if (mealDate === today) {
            totals.totalCalories += parseFloat(meal.calories) || 0;
            totals.totalProtein += parseFloat(meal.protein) || 0;
            totals.totalCarbs += parseFloat(meal.carbs) || 0;
            totals.totalFats += parseFloat(meal.fats) || 0;
          }
        });

        setDailyData({
          ...totals,
          totalWater: parseInt(waterIntake) || 0,
        });
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // 🔹 Save goals
  const handleSaveGoals = async () => {
    setSaving(true);
    try {
      const newGoals = {
        calorieGoal: parseInt(goals.calorieGoal) || 0,
        proteinGoal: parseInt(goals.proteinGoal) || 0,
        carbsGoal: parseInt(goals.carbsGoal) || 0,
        fatsGoal: parseInt(goals.fatsGoal) || 0,
        waterGoal: parseInt(goals.waterGoal) || 0,
      };

      await AsyncStorage.setItem("nutritionGoals", JSON.stringify(newGoals));
      setGoals(newGoals); // ✅ update state immediately
      Alert.alert("✅ Success", "Your goals have been updated!");
    } catch (err) {
      console.error("Error saving goals:", err);
      Alert.alert("❌ Error", "Could not save your goals.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#6200EE" />
      </View>
    );
  }

  // 🔹 Labels mapping for cleaner UI
  const goalLabels = {
    calorieGoal: "Calories (kcal)",
    proteinGoal: "Protein (g)",
    carbsGoal: "Carbs (g)",
    fatsGoal: "Fats (g)",
    waterGoal: "Water (ml)",
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        <Text style={styles.header}>🎯 Daily Nutrition Goals</Text>

        <View style={styles.card}>
          {Object.keys(goalLabels).map((key) => (
            <View key={key} style={styles.inputContainer}>
              <Text style={styles.label}>{goalLabels[key]}</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={String(goals[key])}
                placeholder={`Enter ${goalLabels[key]}`}
                onChangeText={(text) =>
                  setGoals({ ...goals, [key]: text.replace(/[^0-9]/g, "") })
                }
              />
            </View>
          ))}

          <TouchableOpacity
            style={[styles.button, saving && { backgroundColor: "#aaa" }]}
            onPress={handleSaveGoals}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Save Goals</Text>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.header}>📊 Today's Intake Progress</Text>
        <View style={styles.card}>
          <ProgressItem
            label="Calories"
            value={dailyData.totalCalories}
            goal={goals.calorieGoal}
            unit=" kcal"
          />
          <ProgressItem
            label="Protein"
            value={dailyData.totalProtein}
            goal={goals.proteinGoal}
            unit=" g"
          />
          <ProgressItem
            label="Carbs"
            value={dailyData.totalCarbs}
            goal={goals.carbsGoal}
            unit=" g"
          />
          <ProgressItem
            label="Fats"
            value={dailyData.totalFats}
            goal={goals.fatsGoal}
            unit=" g"
          />
          <ProgressItem
            label="Water"
            value={dailyData.totalWater}
            goal={goals.waterGoal}
            unit=" ml"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9F9FB", padding: 20 },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 10,
    color: "#222",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  inputContainer: { marginBottom: 15 },
  label: { fontSize: 16, fontWeight: "600", color: "#555", marginBottom: 5 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#FAFAFA",
  },
  button: {
    backgroundColor: "#6200EE",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 15,
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  progressContainer: { marginVertical: 10 },
  progressLabel: { fontSize: 16, marginBottom: 6, color: "#333" },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
});

export default GoalManagementScreen;
