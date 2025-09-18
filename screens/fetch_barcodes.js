const fs = require("fs");
const fetch = require("node-fetch"); // install with: npm install node-fetch@2

const BASE_URL = "https://world.openfoodfacts.org/api/v2/search";

async function fetchIndianProducts(limit = 100) {
  try {
    const response = await fetch(
      `${BASE_URL}?countries_tags=en:india&sort_by=unique_scans_n&page_size=${limit}`
    );
    const data = await response.json();

    if (!data.products) {
      console.error("❌ No products found.");
      return;
    }

    const products = data.products
      .filter((p) => p.code && p.product_name)
      .map((p) => ({
        code: p.code,
        name: p.product_name,
        calories: p.nutriments?.["energy-kcal_100g"] || 0,
        protein: p.nutriments?.["proteins_100g"] || 0,
        carbs: p.nutriments?.["carbohydrates_100g"] || 0,
        fats: p.nutriments?.["fat_100g"] || 0,
        image: p.image_url || null,
      }));

    fs.writeFileSync("barcodes.json", JSON.stringify(products, null, 2));
    console.log(`✅ Saved ${products.length} Indian products to barcodes.json`);
  } catch (error) {
    console.error("❌ Error fetching products:", error);
  }
}

fetchIndianProducts(100);
