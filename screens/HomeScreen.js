import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image,
  Modal,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import LinearGradient from "react-native-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

export default function HomeScreen() {
  const navigation = useNavigation();
  const [userData, setUserData] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);

  const [totals, setTotals] = useState({
    calories: 0,
    protein: 0,
    water: 0,
  });

  const [goals, setGoals] = useState({
    calorieGoal: 2000,
    proteinGoal: 100,
    waterGoal: 2500,
  });

  // 🔹 Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        const profile = await AsyncStorage.getItem("userProfile");
        if (profile) setUserData(JSON.parse(profile));

        const savedGoals = await AsyncStorage.getItem("nutritionGoals");
        if (savedGoals) setGoals(JSON.parse(savedGoals));

        const savedFoods = await AsyncStorage.getItem("selectedFoods");
        const meals = savedFoods ? JSON.parse(savedFoods) : [];

        const today = new Date().toISOString().split("T")[0];
        let calories = 0;
        let protein = 0;

        meals.forEach((meal) => {
          const mealDate = meal.timestamp?.split("T")[0];
          if (mealDate === today) {
            calories += parseFloat(meal.calories) || 0;
            protein += parseFloat(meal.protein) || 0;
          }
        });

        const water = parseInt(await AsyncStorage.getItem("waterIntake")) || 0;
        setTotals({ calories, protein, water });
      } catch (err) {
        console.error("Error loading home data:", err);
      }
    };

    loadData();
    const focusListener = navigation.addListener("focus", loadData);
    return focusListener;
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <LinearGradient colors={["#6A11CB", "#2575FC"]} style={styles.header}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.welcomeText}>
                Hi, {userData?.name || "User"} 👋
              </Text>
              <Text style={styles.subText}>
                Stay motivated, stay strong 💪
              </Text>
            </View>
            <TouchableOpacity onPress={() => setMenuVisible(true)}>
              <Image
                source={
                  userData?.photoURL
                    ? { uri: userData.photoURL }
                    : require("./assets/profile.jpg")
                }
                style={styles.avatar}
              />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Stats */}
        <View style={styles.statsContainer}>
          {[
            {
              icon: "fire",
              color: "#FF6B6B",
              label: "Calories",
              value: `${Math.round(totals.calories)}/${goals.calorieGoal} kcal`,
            },
            {
              icon: "dumbbell",
              color: "#4D96FF",
              label: "Protein",
              value: `${Math.round(totals.protein)}/${goals.proteinGoal} g`,
            },
            {
              icon: "cup-water",
              color: "#1ABC9C",
              label: "Water",
              value: `${Math.round(totals.water / 1000)}/${goals.waterGoal / 1000} L`,
            },
          ].map((item, index) => (
            <View key={index} style={styles.statCard}>
              <Icon name={item.icon} size={30} color={item.color} />
              <Text style={styles.statValue}>{item.value}</Text>
              <Text style={styles.statLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* Navigation Grid */}
        <View style={styles.grid}>
          {[
            { name: "Meal Log", icon: "food", color: "#FF9800", route: "MealLogScreen" },
            { name: "Goals", icon: "target", color: "#F44336", route: "GoalManagementScreen" },
            { name: "Tips", icon: "lightbulb-on", color: "#FFD700", route: "RecommendationModule" },
            { name: "Analytics", icon: "chart-line", color: "#42A5F5", route: "AnalyticsModule" },
            { name: "Barcode Scanner", icon: "barcode-scan", color: "#8E24AA", route: "BarcodeScannerScreen" },
          ].map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.gridItem}
              onPress={() => navigation.navigate(item.route)}
            >
              <Icon name={item.icon} size={36} color={item.color} />
              <Text style={styles.gridText}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Profile Modal */}
      <Modal visible={menuVisible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setMenuVisible(false)}
          activeOpacity={1}
        >
          <View style={styles.menuBox}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                navigation.navigate("ProfileScreen");
              }}
            >
              <Icon name="account-circle" size={22} color="#6A11CB" />
              <Text style={styles.menuText}>Profile</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  scrollContainer: { paddingBottom: 40 },
  header: {
    padding: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  welcomeText: { fontSize: 26, fontWeight: "bold", color: "#fff" },
  subText: { fontSize: 15, color: "#E0E0E0", marginTop: 5 },
  avatar: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    borderWidth: 3,
    borderColor: "#fff",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginHorizontal: 15,
    marginBottom: 25,
  },
  statCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 15,
    paddingHorizontal: 10,
    alignItems: "center",
    width: "28%",
  },
  statValue: { fontSize: 16, fontWeight: "bold", marginTop: 5, color: "#2C3E50" },
  statLabel: { fontSize: 12, color: "#7F8C8D", marginTop: 3 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  gridItem: {
    backgroundColor: "#fff",
    width: "47%",
    borderRadius: 20,
    padding: 25,
    marginBottom: 18,
    alignItems: "center",
  },
  gridText: { marginTop: 12, fontSize: 15, fontWeight: "700", color: "#34495E" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  menuBox: {
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 10,
    width: 220,
    marginBottom: 80,
  },
  menuItem: { flexDirection: "row", alignItems: "center", padding: 14 },
  menuText: { marginLeft: 10, fontSize: 16, fontWeight: "600", color: "#2C3E50" },
});
