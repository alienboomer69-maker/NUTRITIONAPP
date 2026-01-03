import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ProductDetailsScreen({ route, navigation }) {
  const { product } = route.params;

  // grams must be string for TextInput
  const [grams, setGrams] = useState("100");

  // ---------- Nutrition calculation ----------
  const nutrition = useMemo(() => {
    const g = Number(grams);
    if (!g || g <= 0) {
      return { calories: 0, protein: 0, carbs: 0, fats: 0 };
    }

    const factor = g / 100;

    return {
      calories: +(product.calories * factor).toFixed(1),
      protein: +(product.protein * factor).toFixed(1),
      carbs: +(product.carbs * factor).toFixed(1),
      fats: +(product.fats * factor).toFixed(1),
    };
  }, [grams]);

  // ---------- Add to Meal Log ----------
  const addToMealLog = async () => {
    const g = Number(grams);

    if (!g || g <= 0) {
      Alert.alert("Invalid input", "Please enter grams greater than 0");
      return;
    }

    const entry = {
      name: product.name,
      grams: g,
      calories: nutrition.calories,
      protein: nutrition.protein,
      carbs: nutrition.carbs,
      fats: nutrition.fats,
      timestamp: new Date().toISOString(),
    };

    try {
      const existing =
        JSON.parse(await AsyncStorage.getItem("selectedFoods")) || [];

      existing.push(entry);
      await AsyncStorage.setItem("selectedFoods", JSON.stringify(existing));

      Alert.alert("Added", "Product added to Meal Log");
      navigation.navigate("MealLogScreen");
    } catch (err) {
      Alert.alert("Error", "Could not save meal");
    }
  };

  return (
    <View style={styles.container}>
      {/* Product Image */}
      {product.image && (
        <Image source={{ uri: product.image }} style={styles.image} />
      )}

      <Text style={styles.name}>{product.name}</Text>

      {/* Grams Input */}
      <View style={styles.gramsBox}>
        <Text style={styles.label}>Enter grams</Text>

        <TextInput
          value={grams}
          onChangeText={setGrams}
          keyboardType="numeric"
          placeholder="e.g. 50"
          style={styles.gramsInput}
        />

        {/* Optional step buttons */}
        <View style={styles.stepper}>
          <TouchableOpacity
            onPress={() =>
              setGrams((g) =>
                Math.max(0, Number(g || 0) - 10).toString()
              )
            }
          >
            <Text style={styles.stepBtn}>−10</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              setGrams((g) => (Number(g || 0) + 10).toString())
            }
          >
            <Text style={styles.stepBtn}>+10</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Nutrition */}
      <View style={styles.nutritionBox}>
        <Text style={styles.nutrient}>Calories: {nutrition.calories} kcal</Text>
        <Text style={styles.nutrient}>Protein: {nutrition.protein} g</Text>
        <Text style={styles.nutrient}>Carbs: {nutrition.carbs} g</Text>
        <Text style={styles.nutrient}>Fats: {nutrition.fats} g</Text>
      </View>

      {/* Add Button */}
      <TouchableOpacity style={styles.addBtn} onPress={addToMealLog}>
        <Text style={styles.addText}>Add to Meal Log</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F2F5",
    padding: 20,
  },
  image: {
    width: "100%",
    height: 200,
    resizeMode: "contain",
    marginBottom: 15,
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#222",
    textAlign: "center",
    marginBottom: 15,
  },
  gramsBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: "600",
  },
  gramsInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginBottom: 10,
  },
  stepper: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  stepBtn: {
    fontSize: 16,
    fontWeight: "bold",
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: "#E0E0E0",
    borderRadius: 8,
  },
  nutritionBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    elevation: 3,
  },
  nutrient: {
    fontSize: 16,
    marginBottom: 6,
  },
  addBtn: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  addText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
