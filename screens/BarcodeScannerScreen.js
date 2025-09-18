import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  Image,
  TextInput,
  ScrollView,
  FlatList,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ✅ Import local barcode database
import barcodeData from "./assets/barcodes.json";

// ✅ Map product images
const images = {
  "amul_milk.png": require("./assets/amul_milk.png"),
  "parle_g.png": require("./assets/parle_g.png"),
};

export default function BarcodeScannerScreen() {
  const [product, setProduct] = useState(null);
  const [enteredCode, setEnteredCode] = useState("");
  const [totalCalories, setTotalCalories] = useState(0);
  const [consumedList, setConsumedList] = useState([]);

  // ✅ Load from storage (shared with MealLog)
  useEffect(() => {
    const loadData = async () => {
      try {
        const savedFoods = await AsyncStorage.getItem("selectedFoods");
        if (savedFoods !== null) {
          const parsed = JSON.parse(savedFoods);
          setConsumedList(parsed);
          const total = parsed.reduce((sum, item) => sum + (item.calories || 0), 0);
          setTotalCalories(total);
        }
      } catch (error) {
        console.log("Error loading data:", error);
      }
    };
    loadData();
  }, []);

  // ✅ Save to storage whenever consumedList changes
  useEffect(() => {
    const saveData = async () => {
      try {
        await AsyncStorage.setItem("selectedFoods", JSON.stringify(consumedList));
      } catch (error) {
        console.log("Error saving data:", error);
      }
    };
    saveData();
  }, [consumedList]);

  // ✅ Find product by barcode
  const searchProduct = () => {
    const found = barcodeData.find((item) => item.code === enteredCode);
    setProduct(found || null);
  };

  // ✅ Consume product → stored in MealLog (selectedFoods)
  const consumeProduct = () => {
    if (!product) return;

    const newEntry = {
      id: Date.now().toString(),
      ...product,
      source: "barcode", // 🔖 mark as from barcode
      timestamp: new Date().toISOString(),
    };

    setConsumedList((prev) => [...prev, newEntry]);
    setTotalCalories((prev) => prev + product.calories);
  };

  // ✅ Delete consumed product
  const deleteProduct = (id, calories) => {
    setConsumedList((prev) => prev.filter((item) => item.id !== id));
    setTotalCalories((prev) => prev - calories);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>📦 Barcode Nutrition Tracker</Text>

      {/* Input for Barcode */}
      <TextInput
        style={styles.input}
        placeholder="Enter barcode..."
        value={enteredCode}
        onChangeText={setEnteredCode}
        keyboardType="numeric"
      />
      <Button title="Find Product" onPress={searchProduct} />

      {/* Show product info */}
      {product ? (
        <View style={styles.productBox}>
          <Image source={images[product.image]} style={styles.productImage} />
          <Text style={styles.productName}>{product.name}</Text>
          <Text>Calories: {product.calories}</Text>
          <Text>Protein: {product.protein} g</Text>

          <Button title="Consume" onPress={consumeProduct} />
        </View>
      ) : (
        <Text style={styles.info}>Enter a barcode to find a product</Text>
      )}

      {/* Consumed list (shared with MealLog) */}
      <View style={styles.listBox}>
        <Text style={styles.subtitle}>🍽️ Consumed Products</Text>
        {consumedList.length === 0 ? (
          <Text style={styles.info}>No products consumed yet.</Text>
        ) : (
          <FlatList
            data={consumedList}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.listItem}>
                <Text style={styles.listText}>
                  {item.name} - {item.calories} kcal
                </Text>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deleteProduct(item.id, item.calories)}
                >
                  <Text style={styles.deleteText}>❌</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        )}
      </View>

      {/* Show total calories */}
      <View style={styles.totalBox}>
        <Text style={styles.totalText}>🔥 Total Calories: {totalCalories}</Text>
        <Button
          title="Reset All"
          color="red"
          onPress={async () => {
            setTotalCalories(0);
            setConsumedList([]);
            await AsyncStorage.setItem("selectedFoods", JSON.stringify([]));
          }}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  subtitle: { fontSize: 18, fontWeight: "600", marginBottom: 10 },
  input: {
    width: "90%",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  info: { marginTop: 10, fontSize: 16, color: "gray" },
  productBox: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
    elevation: 4,
    width: "90%",
  },
  productImage: {
    width: 120,
    height: 120,
    marginBottom: 10,
    resizeMode: "contain",
  },
  productName: { fontSize: 18, fontWeight: "bold", marginBottom: 5 },
  listBox: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    width: "90%",
  },
  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    padding: 10,
    backgroundColor: "#f1f1f1",
    borderRadius: 6,
  },
  listText: { fontSize: 16 },
  deleteButton: {
    backgroundColor: "#ffdddd",
    padding: 6,
    borderRadius: 5,
  },
  deleteText: { color: "red", fontWeight: "bold" },
  totalBox: {
    marginTop: 30,
    padding: 15,
    backgroundColor: "#e3f2fd",
    borderRadius: 10,
    alignItems: "center",
    width: "90%",
  },
  totalText: { fontSize: 18, fontWeight: "bold", color: "#0d47a1" },
});
