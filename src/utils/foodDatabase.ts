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
    foodGroup: 'Proteins' | 'Vegetables' | 'Fruits' | 'Grains' | 'Dairy' | 'Fats' | 'Snacks' | 'Beverages';
}

export const foodDatabase: Food[] = [
    // Breakfast
    { id: '1', name: 'Idli (2 pieces)', calories: 120, protein: 4, carbs: 24, fats: 1, category: 'breakfast', servingSize: '2 pieces', foodGroup: 'Grains' },
    { id: '2', name: 'Dosa (1 plain)', calories: 168, protein: 4, carbs: 28, fats: 4, category: 'breakfast', servingSize: '1 dosa', foodGroup: 'Grains' },
    { id: '3', name: 'Poha (1 bowl)', calories: 250, protein: 6, carbs: 45, fats: 5, category: 'breakfast', servingSize: '1 bowl', foodGroup: 'Grains' },
    { id: '4', name: 'Upma (1 bowl)', calories: 200, protein: 5, carbs: 35, fats: 4, category: 'breakfast', servingSize: '1 bowl', foodGroup: 'Grains' },
    { id: '5', name: 'Paratha (1 piece)', calories: 300, protein: 6, carbs: 40, fats: 12, category: 'breakfast', servingSize: '1 piece', foodGroup: 'Grains' },
    { id: '6', name: 'Oats (1 bowl)', calories: 150, protein: 5, carbs: 27, fats: 3, category: 'breakfast', servingSize: '1 bowl', foodGroup: 'Grains' },
    { id: '7', name: 'Eggs (2 boiled)', calories: 140, protein: 12, carbs: 1, fats: 10, category: 'breakfast', servingSize: '2 eggs', foodGroup: 'Proteins' },
    { id: '31', name: 'Medu Vada (2 pieces)', calories: 195, protein: 5, carbs: 22, fats: 9, category: 'breakfast', servingSize: '2 pieces', foodGroup: 'Proteins' },
    { id: '32', name: 'Masala Dosa', calories: 350, protein: 8, carbs: 55, fats: 10, category: 'breakfast', servingSize: '1 dosa', foodGroup: 'Grains' },
    { id: '33', name: 'Aloo Paratha', calories: 290, protein: 6, carbs: 45, fats: 11, category: 'breakfast', servingSize: '1 piece', foodGroup: 'Grains' },
    { id: '34', name: 'Pongal (1 bowl)', calories: 285, protein: 7, carbs: 48, fats: 8, category: 'breakfast', servingSize: '1 bowl', foodGroup: 'Grains' },

    // Lunch
    { id: '9', name: 'Rice (1 bowl)', calories: 200, protein: 4, carbs: 45, fats: 0.5, category: 'lunch', servingSize: '1 bowl', foodGroup: 'Grains' },
    { id: '10', name: 'Roti (2 pieces)', calories: 140, protein: 5, carbs: 30, fats: 1, category: 'lunch', servingSize: '2 pieces', foodGroup: 'Grains' },
    { id: '11', name: 'Dal (1 bowl)', calories: 150, protein: 9, carbs: 20, fats: 4, category: 'lunch', servingSize: '1 bowl', foodGroup: 'Proteins' },
    { id: '12', name: 'Chicken Curry', calories: 300, protein: 25, carbs: 10, fats: 18, category: 'lunch', servingSize: '1 bowl', foodGroup: 'Proteins' },
    { id: '35', name: 'Lemon Rice', calories: 250, protein: 5, carbs: 42, fats: 7, category: 'lunch', servingSize: '1 bowl', foodGroup: 'Grains' },
    { id: '36', name: 'Chole Bhature', calories: 450, protein: 12, carbs: 65, fats: 15, category: 'lunch', servingSize: '1 plate', foodGroup: 'Proteins' },
    { id: '37', name: 'Fish Curry', calories: 280, protein: 22, carbs: 8, fats: 16, category: 'lunch', servingSize: '1 bowl', foodGroup: 'Proteins' },
    { id: '38', name: 'Thali (Veg)', calories: 650, protein: 18, carbs: 95, fats: 22, category: 'lunch', servingSize: '1 plate', foodGroup: 'Grains' },

    // Dinner
    { id: '13', name: 'Paneer Curry', calories: 280, protein: 15, carbs: 12, fats: 20, category: 'dinner', servingSize: '1 bowl', foodGroup: 'Dairy' },
    { id: '14', name: 'Rajma Chawal', calories: 420, protein: 16, carbs: 80, fats: 5, category: 'dinner', servingSize: '1 plate', foodGroup: 'Proteins' },
    { id: '15', name: 'Chole (1 bowl)', calories: 240, protein: 10, carbs: 38, fats: 5, category: 'dinner', servingSize: '1 bowl', foodGroup: 'Proteins' },
    { id: '16', name: 'Chicken Biryani', calories: 550, protein: 28, carbs: 75, fats: 14, category: 'dinner', servingSize: '1 plate', foodGroup: 'Grains' },
    { id: '39', name: 'Butter Chicken', calories: 450, protein: 32, carbs: 12, fats: 28, category: 'dinner', servingSize: '1 bowl', foodGroup: 'Proteins' },
    { id: '40', name: 'Dal Makhani', calories: 320, protein: 14, carbs: 28, fats: 18, category: 'dinner', servingSize: '1 bowl', foodGroup: 'Proteins' },
    { id: '41', name: 'Palak Paneer', calories: 260, protein: 16, carbs: 10, fats: 18, category: 'dinner', servingSize: '1 bowl', foodGroup: 'Dairy' },
    { id: '42', name: 'Mutton Rogan Josh', calories: 380, protein: 26, carbs: 8, fats: 24, category: 'dinner', servingSize: '1 bowl', foodGroup: 'Proteins' },
    { id: '43', name: 'Veg Pulao', calories: 240, protein: 6, carbs: 48, fats: 4, category: 'dinner', servingSize: '1 bowl', foodGroup: 'Grains' },
    { id: '44', name: 'Curd Rice', calories: 180, protein: 6, carbs: 32, fats: 4, category: 'dinner', servingSize: '1 bowl', foodGroup: 'Dairy' },

    // Snacks
    { id: '19', name: 'Samosa (1 piece)', calories: 262, protein: 5, carbs: 30, fats: 13, category: 'snack', servingSize: '1 piece', foodGroup: 'Snacks' },
    { id: '20', name: 'Pakora (5 pieces)', calories: 200, protein: 4, carbs: 22, fats: 10, category: 'snack', servingSize: '5 pieces', foodGroup: 'Snacks' },
    { id: '45', name: 'Bhel Puri', calories: 150, protein: 3, carbs: 28, fats: 4, category: 'snack', servingSize: '1 bowl', foodGroup: 'Grains' },
    { id: '46', name: 'Pani Puri (6 pieces)', calories: 180, protein: 2, carbs: 35, fats: 5, category: 'snack', servingSize: '6 pieces', foodGroup: 'Snacks' },
    { id: '47', name: 'Roasted Makhana', calories: 110, protein: 3, carbs: 20, fats: 2, category: 'snack', servingSize: '1 bowl', foodGroup: 'Snacks' },
    { id: '48', name: 'Paneer Tikka (4 pieces)', calories: 220, protein: 18, carbs: 8, fats: 14, category: 'snack', servingSize: '4 pieces', foodGroup: 'Dairy' },
    { id: '21', name: 'Banana (1 medium)', calories: 105, protein: 1, carbs: 27, fats: 0.5, category: 'snack', servingSize: '1 banana', foodGroup: 'Fruits' },
    { id: '22', name: 'Apple (1 medium)', calories: 95, protein: 0.5, carbs: 25, fats: 0.3, category: 'snack', servingSize: '1 apple', foodGroup: 'Fruits' },
    { id: '23', name: 'Almonds (10 pieces)', calories: 70, protein: 2.5, carbs: 2.5, fats: 6, category: 'snack', servingSize: '10 pieces', foodGroup: 'Fats' },

    // Beverages
    { id: '28', name: 'Masala Tea', calories: 45, protein: 2, carbs: 8, fats: 1.5, category: 'snack', servingSize: '1 cup', foodGroup: 'Beverages' },
    { id: '29', name: 'Filter Coffee', calories: 60, protein: 2, carbs: 10, fats: 2, category: 'snack', servingSize: '1 cup', foodGroup: 'Beverages' },
    { id: '49', name: 'Lassi', calories: 180, protein: 6, carbs: 25, fats: 6, category: 'snack', servingSize: '1 glass', foodGroup: 'Dairy' },
    { id: '50', name: 'Coconut Water', calories: 45, protein: 0.5, carbs: 10, fats: 0.1, category: 'snack', servingSize: '1 coconut', foodGroup: 'Beverages' },
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
