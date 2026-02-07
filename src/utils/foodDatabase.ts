// Common Indian and International Foods Database
export interface Food {
    id: string;
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    category: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    servingSize: string;
}

export const foodDatabase: Food[] = [
    // Breakfast
    { id: '1', name: 'Idli (2 pieces)', calories: 120, protein: 4, carbs: 24, fats: 1, category: 'breakfast', servingSize: '2 pieces' },
    { id: '2', name: 'Dosa (1 plain)', calories: 168, protein: 4, carbs: 28, fats: 4, category: 'breakfast', servingSize: '1 dosa' },
    { id: '3', name: 'Poha (1 bowl)', calories: 250, protein: 6, carbs: 45, fats: 5, category: 'breakfast', servingSize: '1 bowl' },
    { id: '4', name: 'Upma (1 bowl)', calories: 200, protein: 5, carbs: 35, fats: 4, category: 'breakfast', servingSize: '1 bowl' },
    { id: '5', name: 'Paratha (1 piece)', calories: 300, protein: 6, carbs: 40, fats: 12, category: 'breakfast', servingSize: '1 piece' },
    { id: '6', name: 'Oats (1 bowl)', calories: 150, protein: 5, carbs: 27, fats: 3, category: 'breakfast', servingSize: '1 bowl' },
    { id: '7', name: 'Eggs (2 boiled)', calories: 140, protein: 12, carbs: 1, fats: 10, category: 'breakfast', servingSize: '2 eggs' },
    { id: '8', name: 'Bread Toast (2 slices)', calories: 160, protein: 6, carbs: 30, fats: 2, category: 'breakfast', servingSize: '2 slices' },

    // Lunch/Dinner
    { id: '9', name: 'Rice (1 bowl)', calories: 200, protein: 4, carbs: 45, fats: 0.5, category: 'lunch', servingSize: '1 bowl' },
    { id: '10', name: 'Roti (2 pieces)', calories: 140, protein: 5, carbs: 30, fats: 1, category: 'lunch', servingSize: '2 pieces' },
    { id: '11', name: 'Dal (1 bowl)', calories: 150, protein: 9, carbs: 20, fats: 4, category: 'lunch', servingSize: '1 bowl' },
    { id: '12', name: 'Chicken Curry (1 bowl)', calories: 300, protein: 25, carbs: 10, fats: 18, category: 'lunch', servingSize: '1 bowl' },
    { id: '13', name: 'Paneer Curry (1 bowl)', calories: 280, protein: 15, carbs: 12, fats: 20, category: 'lunch', servingSize: '1 bowl' },
    { id: '14', name: 'Rajma (1 bowl)', calories: 220, protein: 12, carbs: 35, fats: 3, category: 'lunch', servingSize: '1 bowl' },
    { id: '15', name: 'Chole (1 bowl)', calories: 240, protein: 10, carbs: 38, fats: 5, category: 'lunch', servingSize: '1 bowl' },
    { id: '16', name: 'Biryani (1 plate)', calories: 500, protein: 20, carbs: 65, fats: 18, category: 'lunch', servingSize: '1 plate' },
    { id: '17', name: 'Sambar (1 bowl)', calories: 120, protein: 5, carbs: 18, fats: 3, category: 'lunch', servingSize: '1 bowl' },
    { id: '18', name: 'Vegetable Curry (1 bowl)', calories: 150, protein: 4, carbs: 20, fats: 6, category: 'lunch', servingSize: '1 bowl' },

    // Snacks
    { id: '19', name: 'Samosa (1 piece)', calories: 262, protein: 5, carbs: 30, fats: 13, category: 'snack', servingSize: '1 piece' },
    { id: '20', name: 'Pakora (5 pieces)', calories: 200, protein: 4, carbs: 22, fats: 10, category: 'snack', servingSize: '5 pieces' },
    { id: '21', name: 'Banana (1 medium)', calories: 105, protein: 1, carbs: 27, fats: 0.5, category: 'snack', servingSize: '1 banana' },
    { id: '22', name: 'Apple (1 medium)', calories: 95, protein: 0.5, carbs: 25, fats: 0.3, category: 'snack', servingSize: '1 apple' },
    { id: '23', name: 'Almonds (10 pieces)', calories: 70, protein: 2.5, carbs: 2.5, fats: 6, category: 'snack', servingSize: '10 pieces' },
    { id: '24', name: 'Biscuits (3 pieces)', calories: 150, protein: 2, carbs: 22, fats: 6, category: 'snack', servingSize: '3 pieces' },
    { id: '25', name: 'Chips (1 small pack)', calories: 150, protein: 2, carbs: 15, fats: 10, category: 'snack', servingSize: '1 pack' },
    { id: '26', name: 'Yogurt (1 cup)', calories: 100, protein: 8, carbs: 12, fats: 2, category: 'snack', servingSize: '1 cup' },

    // Beverages & Others
    { id: '27', name: 'Milk (1 glass)', calories: 150, protein: 8, carbs: 12, fats: 8, category: 'snack', servingSize: '1 glass' },
    { id: '28', name: 'Tea (1 cup)', calories: 30, protein: 1, carbs: 5, fats: 1, category: 'snack', servingSize: '1 cup' },
    { id: '29', name: 'Coffee (1 cup)', calories: 5, protein: 0.3, carbs: 1, fats: 0, category: 'snack', servingSize: '1 cup' },
    { id: '30', name: 'Fruit Juice (1 glass)', calories: 120, protein: 1, carbs: 28, fats: 0.5, category: 'snack', servingSize: '1 glass' },
];

export function searchFoods(query: string): Food[] {
    if (!query.trim()) return foodDatabase;

    const lowerQuery = query.toLowerCase();
    return foodDatabase.filter(food =>
        food.name.toLowerCase().includes(lowerQuery)
    );
}

export function getFoodsByCategory(category: Food['category']): Food[] {
    return foodDatabase.filter(food => food.category === category);
}
