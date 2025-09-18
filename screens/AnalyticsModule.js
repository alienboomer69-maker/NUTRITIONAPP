import React, { useState, useEffect, useCallback } from "react";
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
  RefreshControl,
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

// 🔹 Mini Tip Component
const Tip = ({ text, color, icon }) => (
  <Text style={{ marginBottom: 8, color }}>
    {icon} {text}
  </Text>
);

export default function AnalyticsModule() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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

  const fetchAnalyticsData = async () => {
    try {
      const savedFoods = await AsyncStorage.getItem("selectedFoods");
      const meals = savedFoods ? JSON.parse(savedFoods) : [];

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

          sumTotals.calories += meal.calories || 0;
          sumTotals.protein += meal.protein || 0;
          sumTotals.carbs += meal.carbs || 0;
          sumTotals.fats += meal.fats || 0;
        }
      });

      setTotals(sumTotals);

      // Weekly
      const weeklyLabels = [];
      const weeklyCalories = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const formattedDate = date.toISOString().split("T")[0];
        weeklyLabels.push(date.toLocaleString("en-US", { weekday: "short" }));
        weeklyCalories.push(dailyTotals[formattedDate]?.calories || 0);
      }

      // Monthly
      const monthlyLabels = [];
      const monthlyCalories = [];
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const formattedDate = date.toISOString().split("T")[0];
        monthlyLabels.push(i % 5 === 0 ? date.getDate().toString() : "");
        monthlyCalories.push(dailyTotals[formattedDate]?.calories || 0);
      }

      setReportData({
        weekly: { labels: weeklyLabels, datasets: [{ data: weeklyCalories }] },
        monthly: { labels: monthlyLabels, datasets: [{ data: monthlyCalories }] },
      });
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      Alert.alert("Error", "Could not load analytics data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAnalyticsData();
  }, []);

  // ✅ Tips logic
  const getTips = () => {
    const tips = [];
    const { calories, protein, carbs, fats } = totals;

    // Calories
    if (calories < GUIDELINES.calories.min)
      tips.push({ text: "Calories too low. Add grains or rice.", color: "red", icon: "⚠️" });
    else if (calories > GUIDELINES.calories.max)
      tips.push({ text: "Calories too high. Cut snacks & sugar.", color: "red", icon: "❌" });
    else tips.push({ text: "Calories on track ✅", color: "green", icon: "✅" });

    // Protein
    if (protein < GUIDELINES.protein.min)
      tips.push({ text: "Low protein — eat eggs, lentils, or tofu.", color: "red", icon: "⚠️" });
    else if (protein > GUIDELINES.protein.max)
      tips.push({ text: "Protein high — balance with carbs & fats.", color: "orange", icon: "⚠️" });
    else tips.push({ text: "Protein good 💪", color: "green", icon: "✅" });

    // Carbs
    if (carbs < GUIDELINES.carbs.min)
      tips.push({ text: "Carbs low. Add fruits, wheat, or rice.", color: "orange", icon: "⚠️" });
    else if (carbs > GUIDELINES.carbs.max)
      tips.push({ text: "Carbs high — reduce refined foods.", color: "red", icon: "❌" });
    else tips.push({ text: "Carbs balanced 🍞", color: "green", icon: "✅" });

    // Fats
    if (fats < GUIDELINES.fats.min)
      tips.push({ text: "Fats low. Add nuts, seeds, avocado.", color: "orange", icon: "⚠️" });
    else if (fats > GUIDELINES.fats.max)
      tips.push({ text: "Fats high — avoid fried foods.", color: "red", icon: "❌" });
    else tips.push({ text: "Fats healthy 🥑", color: "green", icon: "✅" });

    return tips;
  };

  const onShare = async () => {
    try {
      const weeklyCalories = reportData.weekly.datasets[0].data.reduce((a, b) => a + b, 0);
      const monthlyCalories = reportData.monthly.datasets[0].data.reduce((a, b) => a + b, 0);

      await Share.share({
        message: `📊 Nutrition Report\n\n--- Weekly ---\nCalories: ${weeklyCalories}\nProtein: ${totals.protein}\nCarbs: ${totals.carbs}\nFats: ${totals.fats}\n\n--- Monthly ---\nCalories: ${monthlyCalories}`,
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

  const chartData = selectedPeriod === "weekly" ? reportData.weekly : reportData.monthly;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text style={styles.title}>Your Health Analytics</Text>

        {/* Summary */}
        <View style={styles.summaryBox}>
          <Text style={styles.summaryText}>📅 Last 30 Days</Text>
          <Text style={styles.summaryValue}>
            Calories: {totals.calories} | Protein: {totals.protein}g | Carbs: {totals.carbs}g | Fats: {totals.fats}g
          </Text>
        </View>

        {/* Period Toggle */}
        <View style={styles.periodSelector}>
          {["weekly", "monthly"].map((period) => (
            <TouchableOpacity
              key={period}
              style={[styles.periodButton, selectedPeriod === period && styles.selectedPeriod]}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  selectedPeriod === period && styles.selectedPeriodText,
                ]}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Chart */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>
            {selectedPeriod === "weekly" ? "Weekly" : "Monthly"} Calorie Intake
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
              No data yet. Log meals to see analytics 📖
            </Text>
          )}
        </View>

        {/* Tips */}
        <View style={styles.guidelineSection}>
          <Text style={styles.sectionTitle}>💡 Tips</Text>
          {getTips().map((tip, idx) => (
            <Tip key={idx} {...tip} />
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
  title: { fontSize: 26, fontWeight: "bold", color: "#333", marginBottom: 20, textAlign: "center" },
  summaryBox: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    alignItems: "center",
    elevation: 3,
  },
  summaryText: { fontSize: 16, color: "#555", marginBottom: 5 },
  summaryValue: { fontSize: 15, fontWeight: "600", color: "#222" },
  periodSelector: { flexDirection: "row", justifyContent: "center", marginBottom: 20 },
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
    elevation: 3,
  },
  chartTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  guidelineSection: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
  },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#333", marginBottom: 10, textAlign: "center" },
  exportButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2196F3",
    padding: 15,
    borderRadius: 10,
  },
  exportButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold", marginLeft: 10 },
  noDataText: { textAlign: "center", color: "#777", paddingVertical: 50 },
});
