import React, { useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import {
  Camera,
  useCameraDevices,
  useCameraPermission,
  useCodeScanner,
} from 'react-native-vision-camera';

export default function ScannerScreen() {
  // 1️⃣ Camera permission
  const { hasPermission, requestPermission } = useCameraPermission();

  // 2️⃣ Camera device (back camera)
  const devices = useCameraDevices();
  const device = devices.back;

  // 3️⃣ Barcode / QR scanner
  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13', 'code-128'],
    onCodeScanned: (codes) => {
      console.log('Scanned codes:', codes);
    },
  });

  // 4️⃣ Ask permission on mount
  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission]);

  // 5️⃣ Loading / permission handling
  if (!hasPermission) {
    return (
      <View style={styles.center}>
        <Text>Camera permission required</Text>
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

  // 6️⃣ Camera view
  return (
    <View style={StyleSheet.absoluteFill}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        codeScanner={codeScanner}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
