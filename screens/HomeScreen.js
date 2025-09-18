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
import auth from "@react-native-firebase/auth"; 
import * as Progress from "react-native-progress"; // ✅ Progress Bars

// 🔹 Mini component for Stat Card
const StatCard = ({ icon, color, label, value, progress }) => (
  <View style={styles.statCard}>
    <Icon name={icon} size={30} color={color} />
    <Text style={styles.statValue}>{value}</Text>
    <Progress.Bar
      progress={progress}
      width={120}
      color={color}
      height={8}
      style={{ marginVertical: 6 }}
    />
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

// 🔹 Mini component for Navigation Grid Item
const GridItem = ({ name, icon, color, route, navigation }) => (
  <TouchableOpacity
    style={styles.gridItem}
    onPress={() => navigation.navigate(route)}
  >
    <Icon name={icon} size={36} color={color} />
    <Text style={styles.gridText}>{name}</Text>
  </TouchableOpacity>
);

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

  // 🔹 Time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  // 🔹 Load data efficiently
  useEffect(() => {
    const loadData = async () => {
      try {
        const [profile, savedGoals, savedFoods, waterIntake] =
          await Promise.all([
            AsyncStorage.getItem("userProfile"),
            AsyncStorage.getItem("nutritionGoals"),
            AsyncStorage.getItem("selectedFoods"),
            AsyncStorage.getItem("waterIntake"),
          ]);

        if (profile) setUserData(JSON.parse(profile));
        if (savedGoals) setGoals(JSON.parse(savedGoals));

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

        const water = parseInt(waterIntake) || 0;
        setTotals({ calories, protein, water });
      } catch (err) {
        console.error("Error loading home data:", err);
      }
    };

    loadData();
    const focusListener = navigation.addListener("focus", loadData);
    return focusListener;
  }, [navigation]);

  // 🔹 Logout handler
  const handleLogout = async () => {
    try {
      await auth().signOut();
    } catch (error) {
      Alert.alert("Logout Error", error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <LinearGradient colors={["#6A11CB", "#2575FC"]} style={styles.header}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.welcomeText}>
                {getGreeting()}, {userData?.name || "User"} 👋
              </Text>
              <Text style={styles.subText}>Stay motivated, stay strong 💪</Text>
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

        {/* Stats with Progress Bars */}
        <View style={styles.statsContainer}>
          <StatCard
            icon="fire"
            color="#FF6B6B"
            label="Calories"
            value={`${Math.round(totals.calories)}/${goals.calorieGoal} kcal`}
            progress={totals.calories / goals.calorieGoal}
          />
          <StatCard
            icon="dumbbell"
            color="#4D96FF"
            label="Protein"
            value={`${Math.round(totals.protein)}/${goals.proteinGoal} g`}
            progress={totals.protein / goals.proteinGoal}
          />
          <StatCard
            icon="cup-water"
            color="#1ABC9C"
            label="Water"
            value={`${Math.round(totals.water / 1000)}/${goals.waterGoal / 1000} L`}
            progress={totals.water / goals.waterGoal}
          />
        </View>

        {/* Navigation Grid */}
        <View style={styles.grid}>
          {[
            {
              name: "Meal Log",
              icon: "food",
              color: "#FF9800",
              route: "MealLogScreen",
            },
            {
              name: "Goals",
              icon: "target",
              color: "#F44336",
              route: "GoalManagementScreen",
            },
            {
              name: "Tips",
              icon: "lightbulb-on",
              color: "#FFD700",
              route: "RecommendationModule",
            },
            {
              name: "Analytics",
              icon: "chart-line",
              color: "#42A5F5",
              route: "AnalyticsModule",
            },
            {
              name: "Barcode Scanner",
              icon: "barcode-scan",
              color: "#8E24AA",
              route: "BarcodeScannerScreen",
            },
            {
              name: "Notifications",
              icon: "bell-ring",
              color: "#FF5722",
              route: "NotificationSettingsScreen",
            },
          ].map((item, index) => (
            <GridItem key={index} {...item} navigation={navigation} />
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
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                handleLogout();
              }}
            >
              <Icon name="logout" size={22} color="#E74C3C" />
              <Text style={styles.menuText}>Logout</Text>
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
    flexWrap: "wrap", // ✅ makes layout responsive
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
    flex: 1,
    marginHorizontal: 5,
  },
  statValue: { fontSize: 16, fontWeight: "bold", marginTop: 8 },
  statLabel: { fontSize: 14, color: "#666" },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    paddingHorizontal: 10,
  },
  gridItem: {
    width: "40%",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginVertical: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  gridText: { marginTop: 10, fontSize: 16, fontWeight: "600" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-end",
  },
  menuBox: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
  },
  menuText: { marginLeft: 10, fontSize: 16, fontWeight: "500" },
});
