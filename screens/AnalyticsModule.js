import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Share,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BarChart } from "react-native-chart-kit";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

// WHO & CDC Guidelines
const GUIDELINES = {
  calories: { min: 1800, max: 2400 },
  protein: { min: 50, max: 70 },
  carbs: { min: 225, max: 325 },
  fats: { min: 44, max: 78 },
};

const chartConfig = {
  backgroundGradientFrom: "#fff",
  backgroundGradientTo: "#fff",
  color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(51, 51, 51, ${opacity})`,
  strokeWidth: 2,
};

export default function AnalyticsModule() {
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState({
    weekly: { labels: [], datasets: [{ data: [] }] },
    monthly: { labels: [], datasets: [{ data: [] }] },
  });
  const [selectedPeriod, setSelectedPeriod] = useState("weekly");
  const [totals, setTotals] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
  });

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        const savedFoods = await AsyncStorage.getItem("selectedFoods");
        const meals = savedFoods ? JSON.parse(savedFoods) : [];

        // Ensure timestamps are valid Date objects
        const parsedMeals = meals
          .map((meal) => ({
            ...meal,
            timestamp: meal.timestamp ? new Date(meal.timestamp) : null,
          }))
          .filter((meal) => meal.timestamp !== null);

        const today = new Date();
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);

        const dailyTotals = {};
        let sumTotals = { calories: 0, protein: 0, carbs: 0, fats: 0 };

        parsedMeals.forEach((meal) => {
          if (meal.timestamp >= thirtyDaysAgo) {
            const date = meal.timestamp.toISOString().split("T")[0];
            if (!dailyTotals[date]) {
              dailyTotals[date] = { calories: 0, protein: 0, carbs: 0, fats: 0 };
            }
            dailyTotals[date].calories += meal.calories || 0;
            dailyTotals[date].protein += meal.protein || 0;
            dailyTotals[date].carbs += meal.carbs || 0;
            dailyTotals[date].fats += meal.fats || 0;

            // For tips (sum totals for last 7 days)
            sumTotals.calories += meal.calories || 0;
            sumTotals.protein += meal.protein || 0;
            sumTotals.carbs += meal.carbs || 0;
            sumTotals.fats += meal.fats || 0;
          }
        });

        setTotals(sumTotals);

        // Weekly (last 7 days)
        const weeklyLabels = [];
        const weeklyCalories = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(today.getDate() - i);
          const formattedDate = date.toISOString().split("T")[0];
          weeklyLabels.push(date.toLocaleString("en-US", { weekday: "short" }));
          weeklyCalories.push(dailyTotals[formattedDate]?.calories || 0);
        }

        // Monthly (last 30 days)
        const monthlyLabels = [];
        const monthlyCalories = [];
        for (let i = 29; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(today.getDate() - i);
          const formattedDate = date.toISOString().split("T")[0];
          if (i % 5 === 0) {
            monthlyLabels.push(date.getDate().toString());
          } else {
            monthlyLabels.push("");
          }
          monthlyCalories.push(dailyTotals[formattedDate]?.calories || 0);
        }

        setReportData({
          weekly: {
            labels: weeklyLabels,
            datasets: [{ data: weeklyCalories }],
          },
          monthly: {
            labels: monthlyLabels,
            datasets: [{ data: monthlyCalories }],
          },
        });
      } catch (error) {
        console.error("Error fetching analytics data:", error);
        Alert.alert("Error", "Could not load analytics data.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  // ✅ Tips logic
  const getTips = () => {
    let tips = [];

    // Calories
    if (totals.calories < GUIDELINES.calories.min) {
      tips.push({ text: "Your calorie intake is too low. Add balanced meals like rice, roti, or grains.", color: "red" });
    } else if (totals.calories > GUIDELINES.calories.max) {
      tips.push({ text: "You’ve exceeded your calorie target. Reduce snacks or high-sugar foods.", color: "red" });
    } else {
      tips.push({ text: "Calories are within range. ✅", color: "green" });
    }

    // Protein
    if (totals.protein < GUIDELINES.protein.min) {
      tips.push({ text: "Low protein intake — add eggs, chicken, lentils, or tofu.", color: "red" });
    } else if (totals.protein > GUIDELINES.protein.max) {
      tips.push({ text: "High protein intake — balance with carbs & fats.", color: "orange" });
    } else {
      tips.push({ text: "Protein intake is on target. 💪", color: "green" });
    }

    // Carbs
    if (totals.carbs < GUIDELINES.carbs.min) {
      tips.push({ text: "Carbs are low. Add fruits, rice, or whole wheat.", color: "orange" });
    } else if (totals.carbs > GUIDELINES.carbs.max) {
      tips.push({ text: "Carbs are high — reduce sugary/refined foods.", color: "red" });
    } else {
      tips.push({ text: "Carb intake is balanced. 🍞", color: "green" });
    }

    // Fats
    if (totals.fats < GUIDELINES.fats.min) {
      tips.push({ text: "Fats are low. Add nuts, seeds, or avocado.", color: "orange" });
    } else if (totals.fats > GUIDELINES.fats.max) {
      tips.push({ text: "Fats are high — cut down fried/processed foods.", color: "red" });
    } else {
      tips.push({ text: "Fats are within range. 🥑", color: "green" });
    }

    return tips;
  };

  const onShare = async () => {
    try {
      const weeklyCalories = reportData.weekly.datasets[0].data.reduce(
        (a, b) => a + b,
        0
      );
      const monthlyCalories = reportData.monthly.datasets[0].data.reduce(
        (a, b) => a + b,
        0
      );

      await Share.share({
        message:
          `📊 Nutritional Report\n\n--- Weekly Summary ---\nTotal Calories: ${weeklyCalories}\n\n--- Monthly Summary ---\nTotal Calories: ${monthlyCalories}`,
      });
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  const chartData =
    selectedPeriod === "weekly" ? reportData.weekly : reportData.monthly;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Your Health Analytics</Text>

        {/* Period Toggle */}
        <View style={styles.periodSelector}>
          <TouchableOpacity
            style={[
              styles.periodButton,
              selectedPeriod === "weekly" && styles.selectedPeriod,
            ]}
            onPress={() => setSelectedPeriod("weekly")}
          >
            <Text
              style={[
                styles.periodButtonText,
                selectedPeriod === "weekly" && styles.selectedPeriodText,
              ]}
            >
              Weekly
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.periodButton,
              selectedPeriod === "monthly" && styles.selectedPeriod,
            ]}
            onPress={() => setSelectedPeriod("monthly")}
          >
            <Text
              style={[
                styles.periodButtonText,
                selectedPeriod === "monthly" && styles.selectedPeriodText,
              ]}
            >
              Monthly
            </Text>
          </TouchableOpacity>
        </View>

        {/* Chart */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>
            Calorie Intake (
            {selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)})
          </Text>
          {chartData.datasets[0].data.length > 0 ? (
            <BarChart
              data={chartData}
              width={350}
              height={220}
              yAxisSuffix=" kcal"
              chartConfig={chartConfig}
              verticalLabelRotation={30}
            />
          ) : (
            <Text style={styles.noDataText}>
              No data to display. Log some meals!
            </Text>
          )}
        </View>

        {/* Tips */}
        <View style={styles.guidelineSection}>
          <Text style={styles.sectionTitle}>💡 Tips</Text>
          {getTips().map((tip, idx) => (
            <Text key={idx} style={{ marginBottom: 8, color: tip.color }}>
              • {tip.text}
            </Text>
          ))}
        </View>

        {/* Export */}
        <TouchableOpacity style={styles.exportButton} onPress={onShare}>
          <Icon name="share-variant" size={20} color="#fff" />
          <Text style={styles.exportButtonText}>Export Report</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0F2F5" },
  centeredContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  scrollContainer: { padding: 20 },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  periodSelector: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  periodButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginHorizontal: 5,
    backgroundColor: "#ddd",
  },
  selectedPeriod: { backgroundColor: "#4CAF50" },
  periodButtonText: { color: "#555", fontWeight: "bold" },
  selectedPeriodText: { color: "#fff" },
  chartContainer: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 10,
    marginBottom: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  chartTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  guidelineSection: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    textAlign: "center",
  },
  exportButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2196F3",
    padding: 15,
    borderRadius: 10,
  },
  exportButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
  noDataText: { textAlign: "center", color: "#777", paddingVertical: 50 },
});
