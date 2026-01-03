import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import { Camera, useCameraDevices } from "react-native-vision-camera";
import { useScanBarcodes, BarcodeFormat } from "vision-camera-code-scanner";

export default function BarcodeCamera({ onScanned }) {
  const devices = useCameraDevices();
  const device = devices.back;

  const [frameProcessor, barcodes] = useScanBarcodes(
    [BarcodeFormat.EAN_13, BarcodeFormat.EAN_8, BarcodeFormat.UPC_A],
    { checkInverted: true }
  );

  useEffect(() => {
    Camera.requestCameraPermission();
  }, []);

  useEffect(() => {
    if (barcodes.length > 0) {
      onScanned(barcodes[0].displayValue);
    }
  }, [barcodes]);

  if (!device) return null;

  return (
    <Camera
      style={StyleSheet.absoluteFill}
      device={device}
      isActive={true}
      frameProcessor={frameProcessor}
      frameProcessorFps={5}
    />
  );
}
