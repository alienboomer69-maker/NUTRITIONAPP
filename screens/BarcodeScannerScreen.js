import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { Camera, useCameraDevice, useCameraPermission, useCodeScanner } from "react-native-vision-camera";
import products from "./products.json";

export default function BarcodeScannerScreen({ navigation }) {
  const device = useCameraDevice("back");
  const { hasPermission, requestPermission } = useCameraPermission();
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    if (!hasPermission) requestPermission();
  }, [hasPermission]);

  const codeScanner = useCodeScanner({
    codeTypes: ["ean-13", "ean-8", "upc-a", "upc-e", "qr"],
    onCodeScanned: (codes) => {
      if (scanned) return;

      const scannedCode = codes[0]?.value;
      if (!scannedCode) return;

      setScanned(true);

      const product = products.find(p => p.code === scannedCode);

      if (!product) {
        Alert.alert("Not Found", "Product not found in database", [
          { text: "Scan Again", onPress: () => setScanned(false) }
        ]);
        return;
      }

      navigation.navigate("ProductDetailsScreen", { product });
    },
  });

  if (!hasPermission) {
    return <Text style={styles.center}>Camera permission required</Text>;
  }

  if (!device) {
    return <Text style={styles.center}>No camera device</Text>;
  }

  return (
    <Camera
      style={StyleSheet.absoluteFill}
      device={device}
      isActive={!scanned}
      codeScanner={codeScanner}
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    textAlign: "center",
    marginTop: 200,
  },
});
