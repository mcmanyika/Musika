

import { GoogleGenAI, Type } from "@google/genai";
import type { Commodity } from '../types';

const fetchCommodityPrices = async (): Promise<Commodity[]> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
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
      console.error("Gemini API returned an empty response text.");
      throw new Error("API returned an empty response.");
    }
    
    let data;
    try {
        data = JSON.parse(jsonText);
    } catch (parseError) {
        console.error("Failed to parse JSON response from Gemini API:", parseError);
        console.error("Raw response text:", jsonText);
        throw new Error("API returned malformed data.");
    }
    
    if (!Array.isArray(data)) {
        console.error("Parsed data is not an array:", data);
        throw new Error("API did not return an array");
    }

    return data as Commodity[];
  } catch (error) {
    console.error("Error fetching or parsing commodity prices from Gemini:", error);
    throw new Error("Failed to get valid data from Gemini API.");
  }
};

export { fetchCommodityPrices };