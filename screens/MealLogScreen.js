import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { debounce } from "lodash";

const API_KEY = "R3WlCdFGpzJITKCmtYa94XHxtDZH7OtHqLnL67Tf"; // USDA API Key
const SEARCH_URL = "https://api.nal.usda.gov/fdc/v1/foods/search";
const DETAILS_URL = "https://api.nal.usda.gov/fdc/v1/food";

const FoodListItem = React.memo(({ item, onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.resultItem}>
    <Text style={styles.resultText}>{item.description}</Text>
  </TouchableOpacity>
));

export default function MealLogScreen() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedFoods, setSelectedFoods] = useState([]);
  const [waterIntake, setWaterIntake] = useState(0);
  const [supplements, setSupplements] = useState([]);
  const [recipes, setRecipes] = useState([]);

  const [modalVisible, setModalVisible] = useState(false);
  const [foodDetails, setFoodDetails] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [calculated, setCalculated] = useState({ calories: 0, protein: 0, carbs: 0, fats: 0 });

  const [customModal, setCustomModal] = useState(false);
  const [customFood, setCustomFood] = useState({ name: "", calories: "" });
  const [recipeModal, setRecipeModal] = useState(false);
  const [recipeName, setRecipeName] = useState("");
  const [loadRecipeModal, setLoadRecipeModal] = useState(false);

  // 🔹 Load saved data
  useEffect(() => {
    const load = async () => {
      try {
        const foods = await AsyncStorage.getItem("selectedFoods");
        const water = await AsyncStorage.getItem("waterIntake");
        const supps = await AsyncStorage.getItem("supplements");
        const savedRecipes = await AsyncStorage.getItem("savedRecipes");

        if (foods) setSelectedFoods(JSON.parse(foods));
        if (water) setWaterIntake(Number(water));
        if (supps) setSupplements(JSON.parse(supps));
        if (savedRecipes) setRecipes(JSON.parse(savedRecipes));
      } catch (e) {
        console.error("Error loading:", e);
      }
    };
    load();
  }, []);

  // 🔹 Save when state changes
  useEffect(() => {
    AsyncStorage.setItem("selectedFoods", JSON.stringify(selectedFoods));
  }, [selectedFoods]);
  useEffect(() => {
    AsyncStorage.setItem("waterIntake", waterIntake.toString());
  }, [waterIntake]);
  useEffect(() => {
    AsyncStorage.setItem("supplements", JSON.stringify(supplements));
  }, [supplements]);
  useEffect(() => {
    AsyncStorage.setItem("savedRecipes", JSON.stringify(recipes));
  }, [recipes]);

  // 🔍 Search USDA API
  const debouncedSearch = useCallback(
    debounce(async (text) => {
      if (!text) return setResults([]);
      setLoading(true);
      try {
        const res = await fetch(`${SEARCH_URL}?query=${encodeURIComponent(text)}&api_key=${API_KEY}&pageSize=15`);
        const data = await res.json();
        setResults(data.foods || []);
      } catch {
        setResults([]);
        Alert.alert("Error", "Could not fetch food data. Try again later.");
      } finally {
        setLoading(false);
      }
    }, 500),
    []
  );

  const handleSearch = (text) => {
    setQuery(text);
    debouncedSearch(text);
  };

  // 🔹 Select food & fetch details
  const handleSelectFood = async (food) => {
    try {
      setQuantity("");
      setCalculated({ calories: 0, protein: 0, carbs: 0, fats: 0 });
      setModalVisible(true);
      const res = await fetch(`${DETAILS_URL}/${food.fdcId}?api_key=${API_KEY}`);
      const data = await res.json();
      setFoodDetails(data);
    } catch {
      Alert.alert("Error", "Could not fetch details");
      setModalVisible(false);
    }
  };

  // 🔹 Calculate macros
  const calculate = (q) => {
    setQuantity(q);
    if (!foodDetails) return;
    const grams = parseFloat(q);
    if (isNaN(grams) || grams <= 0) {
      setCalculated({ calories: 0, protein: 0, carbs: 0, fats: 0 });
      return;
    }
    const getNutrient = (id) => foodDetails.foodNutrients.find((n) => n.nutrient.id === id)?.amount || 0;
    setCalculated({
      calories: ((getNutrient(1008) / 100) * grams).toFixed(1),
      protein: ((getNutrient(1003) / 100) * grams).toFixed(1),
      carbs: ((getNutrient(1005) / 100) * grams).toFixed(1),
      fats: ((getNutrient(1004) / 100) * grams).toFixed(1),
    });
  };

  // 🔹 Add food
  const handleAddFood = () => {
    if (!quantity || parseFloat(quantity) <= 0) {
      Alert.alert("Invalid Quantity", "Please enter a valid amount in grams.");
      return;
    }
    const newFood = {
      id: Date.now().toString(),
      name: foodDetails.description,
      quantity: parseFloat(quantity),
      ...calculated,
      timestamp: new Date().toISOString(),
    };
    setSelectedFoods((prev) => [...prev, newFood]);
    setModalVisible(false);
    setQuery("");
    setResults([]);
  };

  // 🔹 Add custom food
  const handleAddCustomFood = () => {
    if (!customFood.name || !customFood.calories || isNaN(parseFloat(customFood.calories))) {
      Alert.alert("Invalid Input", "Please enter a valid name and calorie count.");
      return;
    }
    const newFood = {
      id: Date.now().toString(),
      name: customFood.name,
      calories: parseFloat(customFood.calories),
      protein: 0,
      carbs: 0,
      fats: 0,
      quantity: "custom",
      timestamp: new Date().toISOString(),
    };
    setSelectedFoods((prev) => [...prev, newFood]);
    setCustomModal(false);
    setCustomFood({ name: "", calories: "" });
  };

  // 🔹 Save recipe
  const handleSaveRecipe = () => {
    if (!recipeName || selectedFoods.length === 0) {
      Alert.alert("Error", "Please log some food and provide a recipe name.");
      return;
    }
    const recipe = { id: Date.now().toString(), name: recipeName, foods: selectedFoods };
    setRecipes((prev) => [...prev, recipe]);
    setRecipeModal(false);
    setRecipeName("");
    Alert.alert("Success", "Recipe saved!");
  };

  // 🔹 Load recipe
  const handleLoadRecipe = (r) => {
    setSelectedFoods(r.foods);
    setLoadRecipeModal(false);
    Alert.alert("Recipe Loaded", `Successfully loaded ${r.name}.`);
  };

  const handleAddWater = (ml) => setWaterIntake((prev) => prev + ml);
  const handleAddSupplement = (name) => {
    setSupplements((prev) => [...prev, { name, time: new Date().toLocaleTimeString() }]);
    Alert.alert("Supplement Logged", `Logged ${name}.`);
  };

  const totalCalories = selectedFoods.reduce((a, f) => a + parseFloat(f.calories || 0), 0).toFixed(1);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>My Daily Log 📊</Text>

      {/* Daily Summary Card */}
      <View style={styles.summaryCard}>
        <Text style={styles.subHeading}>Daily Summary</Text>
        <Text style={styles.summaryText}>🔥 Total Calories: <Text style={styles.boldText}>{totalCalories} kcal</Text></Text>
        <Text style={styles.summaryText}>💧 Water Intake: <Text style={styles.boldText}>{waterIntake} ml</Text></Text>
      </View>

      {/* Log Section */}
      <View style={styles.card}>
        <Text style={styles.subHeading}>Add to Log</Text>
        <TextInput
          style={styles.input}
          placeholder="🔍 Search for a food..."
          value={query}
          onChangeText={handleSearch}
        />
        {loading && <ActivityIndicator style={{ marginVertical: 10 }} />}
        {results.length > 0 && (
          <View style={styles.resultsContainer}>
            <FlatList
              data={results}
              keyExtractor={(item) => item.fdcId.toString()}
              renderItem={({ item }) => (
                <FoodListItem item={item} onPress={() => handleSelectFood(item)} />
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          </View>
        )}
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.actionButton} onPress={() => setCustomModal(true)}>
            <Text style={styles.buttonText}>✍️ Custom Food</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => setWaterIntake((prev) => prev + 250)}>
            <Text style={styles.buttonText}>💧 Add 250ml</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.actionButton} onPress={() => setWaterIntake((prev) => prev + 500)}>
            <Text style={styles.buttonText}>💧 Add 500ml</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => setLoadRecipeModal(true)}>
            <Text style={styles.buttonText}>🍲 Load Recipe</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Logged Foods Card */}
      <View style={styles.card}>
        <Text style={styles.subHeading}>Today's Foods</Text>
        {selectedFoods.length === 0 ? (
          <Text style={styles.emptyText}>No food logged yet. Start by searching!</Text>
        ) : (
          <FlatList
            data={selectedFoods}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.logItem}>
                <View style={{ flex: 1, marginRight: 10 }}>
                  <Text style={styles.logItemName}>{item.name}</Text>
                  <Text style={styles.logItemDetails}>
                    {item.calories} kcal • {item.quantity}g
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedFoods((prev) => prev.filter((x) => x.id !== item.id))}>
                  <Text style={styles.removeButton}>Remove</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        )}
      </View>

      {/* Saved Recipes Card */}
      <View style={styles.card}>
        <Text style={styles.subHeading}>My Recipes</Text>
        <TouchableOpacity style={styles.recipeButton} onPress={() => setRecipeModal(true)}>
          <Text style={styles.recipeButtonText}>Save This Meal as a Recipe</Text>
        </TouchableOpacity>
        {recipes.length > 0 && (
          <FlatList
            data={recipes}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.recipeListItem} onPress={() => handleLoadRecipe(item)}>
                <Text style={styles.recipeName}>{item.name}</Text>
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        )}
      </View>

      {/* Supplements Card */}
      <View style={styles.card}>
        <Text style={styles.subHeading}>Supplements</Text>
        <TouchableOpacity style={styles.supplementButton} onPress={() => handleAddSupplement("Multivitamin")}>
          <Text style={styles.supplementButtonText}>Log Multivitamin</Text>
        </TouchableOpacity>
        {supplements.length > 0 && (
          <View style={{ marginTop: 10 }}>
            {supplements.map((s, i) => (
              <Text key={i} style={styles.supplementItem}>💊 {s.name} at {s.time}</Text>
            ))}
          </View>
        )}
      </View>

      {/* Modals */}
      {/* Food Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Food</Text>
            <Text style={styles.modalSubtitle}>Enter quantity for {foodDetails?.description}</Text>
            <TextInput
              style={styles.modalInput}
              keyboardType="numeric"
              placeholder="Enter quantity in grams (e.g., 100)"
              value={quantity}
              onChangeText={calculate}
            />
            <View style={styles.modalMacros}>
              <Text style={styles.modalMacroText}>Kcal: {calculated.calories}</Text>
              <Text style={styles.modalMacroText}>Protein: {calculated.protein}g</Text>
              <Text style={styles.modalMacroText}>Carbs: {calculated.carbs}g</Text>
              <Text style={styles.modalMacroText}>Fats: {calculated.fats}g</Text>
            </View>
            <TouchableOpacity style={styles.modalButton} onPress={handleAddFood}>
              <Text style={styles.modalButtonText}>Add to Log</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Custom Food Modal */}
      <Modal visible={customModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Custom Food</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Food Name"
              value={customFood.name}
              onChangeText={(t) => setCustomFood({ ...customFood, name: t })}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Calories (kcal)"
              keyboardType="numeric"
              value={customFood.calories}
              onChangeText={(t) => setCustomFood({ ...customFood, calories: t })}
            />
            <TouchableOpacity style={styles.modalButton} onPress={handleAddCustomFood}>
              <Text style={styles.modalButtonText}>Save Food</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setCustomModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Save Recipe Modal */}
      <Modal visible={recipeModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Save Current Meal</Text>
            <Text style={styles.modalSubtitle}>Give your recipe a name:</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Recipe Name"
              value={recipeName}
              onChangeText={setRecipeName}
            />
            <TouchableOpacity style={styles.modalButton} onPress={handleSaveRecipe}>
              <Text style={styles.modalButtonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setRecipeModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Load Recipe Modal */}
      <Modal visible={loadRecipeModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Load a Recipe</Text>
            <FlatList
              data={recipes}
              keyExtractor={(item) => item.id}
              ListEmptyComponent={<Text style={{ textAlign: 'center', color: '#666' }}>No recipes saved.</Text>}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.modalRecipeItem} onPress={() => handleLoadRecipe(item)}>
                  <Text style={styles.recipeName}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity onPress={() => setLoadRecipeModal(false)}>
              <Text style={styles.modalCancel}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F4F8",
    padding: 20,
  },
  heading: {
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 20,
    color: "#1E293B",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  summaryCard: {
    backgroundColor: "#E2F0F9",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  subHeading: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 15,
    color: "#334155",
  },
  summaryText: {
    fontSize: 16,
    color: "#475569",
    marginBottom: 5,
  },
  boldText: {
    fontWeight: "bold",
    color: "#1E293B",
  },
  input: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#F8FAFC",
    fontSize: 16,
    color: "#334155",
  },
  resultsContainer: {
    maxHeight: 200,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginTop: 10,
    overflow: "hidden",
  },
  resultItem: {
    padding: 15,
    backgroundColor: "#F8FAFC",
  },
  resultText: {
    fontSize: 16,
    color: "#475569",
  },
  separator: {
    height: 1,
    backgroundColor: "#E2E8F0",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  actionButton: {
    backgroundColor: "#3B82F6",
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  emptyText: {
    textAlign: "center",
    color: "#666",
    fontStyle: "italic",
    marginTop: 10,
  },
  logItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  logItemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
  },
  logItemDetails: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 2,
  },
  removeButton: {
    color: "#EF4444",
    fontWeight: "bold",
  },
  recipeButton: {
    backgroundColor: "#10B981",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  recipeButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  recipeListItem: {
    padding: 15,
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    marginBottom: 8,
  },
  recipeName: {
    fontSize: 16,
    color: "#334155",
  },
  supplementButton: {
    backgroundColor: "#6B7280",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  supplementButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  supplementItem: {
    fontSize: 14,
    color: "#475569",
    marginBottom: 5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 25,
    width: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    color: "#1E293B",
    marginBottom: 5,
  },
  modalSubtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#64748B",
    marginBottom: 20,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#F8FAFC",
    fontSize: 16,
    marginBottom: 15,
  },
  modalMacros: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  modalMacroText: {
    fontSize: 14,
    color: "#475569",
    fontWeight: "600",
    minWidth: "45%",
    marginBottom: 5,
  },
  modalButton: {
    backgroundColor: "#3B82F6",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  modalCancel: {
    color: "#EF4444",
    textAlign: "center",
    fontSize: 16,
    marginTop: 5,
  },
  modalRecipeItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
});