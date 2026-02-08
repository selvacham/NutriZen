import { GoogleGenerativeAI } from '@google/generative-ai';

// Note: Ensure EXPO_PUBLIC_GEMINI_API_KEY is defined in your environment
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(API_KEY);

export interface VisionResult {
    food_name: string;
    calories: number;
    protein_g: number;
    carbs_g: number;
    fats_g: number;
    meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    food_group: string;
    confidence: number;
}

export const analyzeMealImage = async (base64Image: string): Promise<VisionResult> => {
    if (!API_KEY) {
        throw new Error('Gemini API Key is missing. Please set EXPO_PUBLIC_GEMINI_API_KEY.');
    }

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `
            Analyze this food image and provide nutritional information.
            Return ONLY a JSON object with the following fields:
            {
                "food_name": "string",
                "calories": number,
                "protein_g": number,
                "carbs_g": number,
                "fats_g": number,
                "meal_type": "breakfast" | "lunch" | "dinner" | "snack",
                "food_group": "Proteins" | "Vegetables" | "Fruits" | "Grains" | "Dairy" | "Fats" | "Snacks" | "Beverages",
                "confidence": number (between 0 and 1)
            }
            Base the meal_type on the time of day if it's ambiguous, but prioritize the food items (e.g., cereal is usually breakfast).
            Be as accurate as possible with estimates.
        `;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Image,
                    mimeType: 'image/jpeg'
                }
            }
        ]);

        const response = await result.response;
        const text = response.text();

        // Clean the response text (sometimes AI wraps JSON in backticks)
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Failed to parse AI response');
        }

        return JSON.parse(jsonMatch[0]) as VisionResult;
    } catch (error) {
        console.error('Vision AI Error:', error);
        throw error;
    }
};

export async function generateGrocerySuggestions(recentLogs: any[]) {
    if (!API_KEY) {
        console.warn('Gemini API Key is missing. Skipping grocery suggestions.');
        return [];
    }

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `Based on the following recent food logs: ${JSON.stringify(recentLogs)}, 
        suggest a list of 5-8 healthy grocery items that the user might need to restock on to maintain their nutrition goals.
        Focus on healthy, whole foods. Return ONLY a JSON array of objects with "name" and "category" fields.
        Example: [{"name": "Greek Yogurt", "category": "Dairy"}, {"name": "Spinach", "category": "Vegetables"}]`;

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        // Extract JSON from response
        const jsonMatch = text.match(/\[.*\]/s);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return [];
    } catch (error) {
        console.error('Error generating grocery suggestions:', error);
        return [];
    }
}

export async function generateMealSuggestion(remainingMacros: { calories: number; protein: number; carbs: number; fats: number }, goal: string) {
    if (!API_KEY) {
        console.warn('Gemini API Key is missing. Skipping meal suggestion.');
        return null;
    }

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `Based on the following remaining daily macros: ${JSON.stringify(remainingMacros)} and the user's goal: "${goal}",
        suggest ONE delicious and healthy meal recipe. 
        Return ONLY a JSON object with the following fields:
        {
            "meal_name": "string",
            "description": "Short appetizing description",
            "macros": { "calories": number, "protein": number, "carbs": number, "fats": number },
            "ingredients": ["string", "string", ...],
            "instructions": ["string", "string", ...],
            "prep_time": "string (e.g. 15 mins)"
        }
        The recipe MUST be realistic and its total macros should ideally fit within or near the remaining budget.`;

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return null;
    } catch (error) {
        console.error('Error generating meal suggestion:', error);
        return null;
    }
}
