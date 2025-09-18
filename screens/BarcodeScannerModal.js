import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Alert, Image } from "react-native";
import { Camera, useCameraDevices } from "react-native-vision-camera";
import { useScanBarcodes, BarcodeFormat } from "vision-camera-code-scanner";
import { requestCameraPermission } from "../utils/permissions";

// ✅ Correct path since barcodes.json is inside screens/assets
import barcodeData from "./assets/barcodes.json";

// ✅ Correct path for images inside screens/assets/images
const images = {
  "amul_milk.png": require("./assets/images/amul_milk.png"),
  "parle_g.png": require("./assets/images/parle_g.png"),
};

export default function BarcodeScannerScreen() {
  const [hasPermission, setHasPermission] = useState(false);
  const [product, setProduct] = useState(null);

  const devices = useCameraDevices();
  const device = devices.back;

  const [frameProcessor, barcodes] = useScanBarcodes([BarcodeFormat.ALL_FORMATS]);

  useEffect(() => {
    (async () => {
      const granted = await requestCameraPermission();
      setHasPermission(granted);
    })();
  }, []);

  useEffect(() => {
    if (barcodes.length > 0) {
      const code = barcodes[0].rawValue;
      console.log("Scanned code:", code);

      const foundProduct = barcodeData.find((item) => item.code === code);
      if (foundProduct) {
        setProduct(foundProduct);
      } else {
        Alert.alert("Unknown Barcode", `No product found for code: ${code}`);
      }
    }
  }, [barcodes]);

  if (!hasPermission) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Camera permission not granted</Text>
      </View>
    );
  }

  if (device == null) {
    return (
      <View style={styles.center}>
        <Text>Loading camera...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        frameProcessor={frameProcessor}
        frameProcessorFps={5}
      />

      {product && (
        <View style={styles.productBox}>
          {product.image && images[product.image] && (
            <Image source={images[product.image]} style={styles.productImage} />
          )}
          <Text style={styles.productName}>{product.name}</Text>
          <Text>Calories: {product.calories}</Text>
          <Text>Protein: {product.protein}g</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  error: { color: "red", fontSize: 16, fontWeight: "bold" },
  productBox: {
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    elevation: 5,
    alignItems: "center",
  },
  productImage: { width: 100, height: 100, marginBottom: 10, resizeMode: "contain" },
  productName: { fontSize: 18, fontWeight: "bold", marginBottom: 5 },
});
