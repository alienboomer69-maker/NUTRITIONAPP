import AsyncStorage from '@react-native-async-storage/async-storage';

export async function addScannedFoodToMealLog(product) {
  const storedFoods = await AsyncStorage.getItem('selectedFoods');
  const selectedFoods = storedFoods ? JSON.parse(storedFoods) : [];

  const newFood = {
    id: Date.now().toString(),
    name: product.name,
    calories: product.calories,
    protein: product.protein,
    carbs: product.carbs,
    fats: product.fats,
    quantity: 'barcode',
    timestamp: new Date().toISOString(),
  };

  const updatedFoods = [...selectedFoods, newFood];

  await AsyncStorage.setItem('selectedFoods', JSON.stringify(updatedFoods));
}
