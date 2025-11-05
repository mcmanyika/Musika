

import { GoogleGenAI, Type } from "@google/genai";
import type { Commodity } from '../types';

const fetchCommodityPrices = async (): Promise<Commodity[]> => {
  // Try both API_KEY and GEMINI_API_KEY for flexibility
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error("API key not found. Checked process.env.API_KEY and process.env.GEMINI_API_KEY");
    throw new Error("API_KEY environment variable not set. Please set GEMINI_API_KEY in your .env file.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const commoditySchema = {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.STRING, description: "A unique slug-like ID" },
      name: { type: Type.STRING, description: "Commodity name" },
      unit: { type: Type.STRING, description: "Unit of measurement (e.g., 'per bucket', 'per bundle')" },
      price: { type: Type.NUMBER, description: "Current price in USD" },
      priceChange: { type: Type.NUMBER, description: "Price change from previous day" },
      history: {
        type: Type.ARRAY,
        description: "Price history for the last 7 days",
        items: {
          type: Type.OBJECT,
          properties: {
            date: { type: Type.STRING, description: "Date in 'MMM D' format" },
            price: { type: Type.NUMBER, description: "Price on that date" },
          },
          required: ["date", "price"],
        },
      },
    },
    required: ["id", "name", "unit", "price", "priceChange", "history"],
  };

  // Try multiple model names in case one is unavailable
  const modelsToTry = ["gemini-2.0-flash-exp", "gemini-1.5-flash", "gemini-pro"];
  let lastError: any = null;

  for (const modelName of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: `
          You are a market analyst specializing in Zimbabwean agriculture. Generate a realistic list of 12 common commodities found at Mbare Musika in Harare.
          For each commodity, provide its details in USD. The list should include local staples like maize meal, vegetables (tomatoes, onions, leafy greens), fruits, and other common goods.
          The price history should span the last 7 days, with the most recent date being today.
          Ensure the data is varied and reflects typical local market fluctuations.
        `,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: commoditySchema,
          },
        },
      });

      const jsonText = response.text?.trim();

      if (!jsonText) {
        console.warn(`Model ${modelName} returned an empty response. Trying next model...`);
        continue;
      }

      let data;
      try {
        data = JSON.parse(jsonText);
      } catch (parseError) {
        console.warn(`Failed to parse JSON response from model ${modelName}:`, parseError);
        continue;
      }

      if (!Array.isArray(data)) {
        console.warn(`Model ${modelName} did not return an array. Trying next model...`);
        continue;
      }

      console.log(`Successfully fetched data using model: ${modelName}`);
      return data as Commodity[];
    } catch (error: any) {
      console.warn(`Model ${modelName} failed:`, error?.message || error);
      lastError = error;
      // Try next model
      continue;
    }
  }

  // If we get here, all models failed
  try {
    throw lastError || new Error("All models failed");
  } catch (error: any) {
    // Preserve the actual error message for debugging
    console.error("Error fetching or parsing commodity prices from Gemini:", error);
    const errorMessage = error?.message || error?.toString() || "Unknown error";

    // Provide more helpful error messages
    if (errorMessage.includes("API_KEY") || errorMessage.includes("apiKey")) {
      throw new Error("Gemini API key is invalid or not set. Please check your GEMINI_API_KEY environment variable.");
    }
    if (errorMessage.includes("model") || errorMessage.includes("Model")) {
      throw new Error(`Gemini model error: ${errorMessage}`);
    }
    if (errorMessage.includes("network") || errorMessage.includes("fetch")) {
      throw new Error("Network error: Could not connect to Gemini API. Please check your internet connection.");
    }

    // Throw the actual error message instead of a generic one
    throw new Error(`Failed to fetch commodity prices: ${errorMessage}`);
  }
};

export { fetchCommodityPrices };