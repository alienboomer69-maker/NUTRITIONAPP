import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useIsFocused } from "@react-navigation/native";

export default function HomeScreen() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const [userName, setUserName] = useState("User");
  const [totalCaloriesToday, setTotalCaloriesToday] = useState(0);
  const [totalProteinToday, setTotalProteinToday] = useState(0);
  const [totalCarbsToday, setTotalCarbsToday] = useState(0);
  const [totalFatToday, setTotalFatToday] = useState(0);

  useEffect(() => {
    const loadDailyData = async () => {
      try {
        const savedFoods = await AsyncStorage.getItem("selectedFoods");
        if (savedFoods) {
          const foods = JSON.parse(savedFoods);

          let caloriesSum = 0;
          let proteinSum = 0;
          let carbsSum = 0;
          let fatSum = 0;

          foods.forEach((food) => {
            caloriesSum += food.calories || 0;
            proteinSum += food.protein || 0;
            carbsSum += food.carbs || 0;
            fatSum += food.fats || 0;
          });

          setTotalCaloriesToday(caloriesSum);
          setTotalProteinToday(proteinSum);
          setTotalCarbsToday(carbsSum);
          setTotalFatToday(fatSum);
        } else {
          setTotalCaloriesToday(0);
          setTotalProteinToday(0);
          setTotalCarbsToday(0);
          setTotalFatToday(0);
        }
      } catch (error) {
        console.error("Error loading meals from storage:", error);
      }
    };

    if (isFocused) {
      loadDailyData();
    }
  }, [isFocused]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.welcomeText}>Welcome, {userName}!</Text>
        <Text style={styles.tagline}>Your personalized nutrition journey starts here.</Text>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Today's Calorie Intake</Text>
          <Text style={styles.calorieCount}>{totalCaloriesToday.toFixed(0)} kcal</Text>
          <Text style={styles.summaryDescription}>Logged from your meals.</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Daily Macro Summary</Text>
          <View style={styles.macroRow}>
            <Text style={styles.macroLabel}>Protein:</Text>
            <Text style={styles.macroValue}>{totalProteinToday.toFixed(1)}g</Text>
          </View>
          <View style={styles.macroRow}>
            <Text style={styles.macroLabel}>Carbs:</Text>
            <Text style={styles.macroValue}>{totalCarbsToday.toFixed(1)}g</Text>
          </View>
          <View style={styles.macroRow}>
            <Text style={styles.macroLabel}>Fat:</Text>
            <Text style={styles.macroValue}>{totalFatToday.toFixed(1)}g</Text>
          </View>
          <Text style={styles.summaryDescription}>Based on your logged meals.</Text>
        </View>

        <View style={styles.cardContainer}>
          <TouchableOpacity
            style={styles.featureCard}
            onPress={() => navigation.navigate("MealLogScreen")}
          >
            <Text style={styles.cardTitle}>Log Meals</Text>
            <Text style={styles.cardDescription}>Track your daily food, water, and supplements.</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F2F2F2" },
  container: { flexGrow: 1, padding: 20, alignItems: "center" },
  welcomeText: { fontSize: 28, fontWeight: "bold", color: "#4CAF50", marginBottom: 10 },
  tagline: { fontSize: 16, color: "#666", marginBottom: 30 },
  summaryCard: {
    backgroundColor: "#E0F2F7",
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: { fontSize: 20, fontWeight: "bold", color: "#2196F3", marginBottom: 10 },
  calorieCount: { fontSize: 48, fontWeight: "bold", color: "#2196F3", marginBottom: 10 },
  summaryDescription: { fontSize: 14, color: "#666", textAlign: "center" },
  macroRow: { flexDirection: "row", justifyContent: "space-between", width: "80%", marginBottom: 5 },
  macroLabel: { fontSize: 16, fontWeight: "600", color: "#333" },
  macroValue: { fontSize: 16, color: "#2196F3", fontWeight: "bold" },
  cardContainer: { width: "100%", marginBottom: 30 },
  featureCard: {
    backgroundColor: "#FFF",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: { fontSize: 20, fontWeight: "bold", color: "#333", marginBottom: 5 },
  cardDescription: { fontSize: 14, color: "#777" },
});
