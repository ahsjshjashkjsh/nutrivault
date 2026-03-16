// Local food database for NLP parsing
// Values are per 100g/100ml unless defaultServing specified

interface FoodEstimate {
  cal: number;
  p: number;  // protein g
  c: number;  // carbs g
  f: number;  // fat g
  defaultServing: number; // grams or ml
  unit: string;
}

export interface ParsedFoodItem {
  name: string;
  displayName: string;
  quantity: number;
  unit: string;
  servingGrams: number;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  isEstimate: boolean;
}

// Per 100g or 100ml nutritional values
const FOOD_DB: Record<string, FoodEstimate> = {
  // Eggs
  "egg": { cal: 155, p: 13, c: 1.1, f: 11, defaultServing: 60, unit: "piece" },
  "eggs": { cal: 155, p: 13, c: 1.1, f: 11, defaultServing: 60, unit: "piece" },
  "fried egg": { cal: 196, p: 14, c: 0.4, f: 15, defaultServing: 55, unit: "piece" },
  "boiled egg": { cal: 155, p: 13, c: 1.1, f: 11, defaultServing: 60, unit: "piece" },
  "scrambled egg": { cal: 149, p: 10, c: 1.7, f: 11, defaultServing: 120, unit: "serving" },
  "omelette": { cal: 154, p: 10, c: 1.2, f: 12, defaultServing: 120, unit: "serving" },

  // Bread / Toast
  "toast": { cal: 285, p: 9, c: 55, f: 3.5, defaultServing: 35, unit: "slice" },
  "bread": { cal: 265, p: 9, c: 49, f: 3.2, defaultServing: 35, unit: "slice" },
  "white bread": { cal: 265, p: 9, c: 49, f: 3.2, defaultServing: 35, unit: "slice" },
  "whole wheat bread": { cal: 247, p: 13, c: 43, f: 3.4, defaultServing: 35, unit: "slice" },
  "whole grain bread": { cal: 247, p: 13, c: 43, f: 3.4, defaultServing: 35, unit: "slice" },
  "sourdough": { cal: 268, p: 10, c: 52, f: 1.2, defaultServing: 35, unit: "slice" },
  "bagel": { cal: 250, p: 10, c: 49, f: 1.4, defaultServing: 105, unit: "piece" },
  "croissant": { cal: 406, p: 8.5, c: 45, f: 21, defaultServing: 57, unit: "piece" },

  // Spreads / Condiments
  "butter": { cal: 717, p: 0.9, c: 0.1, f: 81, defaultServing: 10, unit: "serving" },
  "margarine": { cal: 717, p: 0.9, c: 0.7, f: 80, defaultServing: 10, unit: "serving" },
  "peanut butter": { cal: 588, p: 25, c: 20, f: 50, defaultServing: 30, unit: "serving" },
  "jam": { cal: 278, p: 0.4, c: 69, f: 0.1, defaultServing: 15, unit: "serving" },
  "honey": { cal: 304, p: 0.3, c: 82, f: 0, defaultServing: 20, unit: "serving" },
  "cream cheese": { cal: 342, p: 6, c: 4.1, f: 34, defaultServing: 30, unit: "serving" },
  "olive oil": { cal: 884, p: 0, c: 0, f: 100, defaultServing: 14, unit: "serving" },
  "oil": { cal: 884, p: 0, c: 0, f: 100, defaultServing: 14, unit: "serving" },

  // Beverages
  "coffee": { cal: 2, p: 0.3, c: 0, f: 0, defaultServing: 240, unit: "cup" },
  "black coffee": { cal: 2, p: 0.3, c: 0, f: 0, defaultServing: 240, unit: "cup" },
  "espresso": { cal: 9, p: 0.6, c: 1.6, f: 0, defaultServing: 30, unit: "serving" },
  "coffee with milk": { cal: 25, p: 1.5, c: 2.5, f: 1.2, defaultServing: 240, unit: "cup" },
  "latte": { cal: 67, p: 3.5, c: 5.5, f: 3.5, defaultServing: 354, unit: "cup" },
  "cappuccino": { cal: 74, p: 3.9, c: 6, f: 3.4, defaultServing: 177, unit: "cup" },
  "tea": { cal: 1, p: 0, c: 0.3, f: 0, defaultServing: 240, unit: "cup" },
  "green tea": { cal: 1, p: 0, c: 0, f: 0, defaultServing: 240, unit: "cup" },
  "milk": { cal: 61, p: 3.2, c: 4.8, f: 3.3, defaultServing: 250, unit: "cup" },
  "skim milk": { cal: 34, p: 3.4, c: 5, f: 0.1, defaultServing: 250, unit: "cup" },
  "orange juice": { cal: 45, p: 0.7, c: 10.4, f: 0.2, defaultServing: 250, unit: "cup" },
  "apple juice": { cal: 46, p: 0.1, c: 11.3, f: 0.1, defaultServing: 250, unit: "cup" },
  "cola": { cal: 42, p: 0, c: 10.6, f: 0, defaultServing: 330, unit: "can" },
  "soda": { cal: 42, p: 0, c: 10.6, f: 0, defaultServing: 330, unit: "can" },
  "water": { cal: 0, p: 0, c: 0, f: 0, defaultServing: 250, unit: "glass" },
  "smoothie": { cal: 60, p: 2, c: 12, f: 1, defaultServing: 350, unit: "serving" },
  "protein shake": { cal: 120, p: 25, c: 5, f: 2, defaultServing: 300, unit: "serving" },

  // Meat & Fish
  "chicken breast": { cal: 165, p: 31, c: 0, f: 3.6, defaultServing: 150, unit: "g" },
  "chicken": { cal: 165, p: 25, c: 0, f: 7, defaultServing: 150, unit: "g" },
  "grilled chicken": { cal: 165, p: 31, c: 0, f: 3.6, defaultServing: 150, unit: "g" },
  "chicken thigh": { cal: 209, p: 26, c: 0, f: 11, defaultServing: 100, unit: "g" },
  "beef": { cal: 250, p: 26, c: 0, f: 15, defaultServing: 150, unit: "g" },
  "ground beef": { cal: 250, p: 26, c: 0, f: 15, defaultServing: 150, unit: "g" },
  "steak": { cal: 270, p: 28, c: 0, f: 17, defaultServing: 200, unit: "g" },
  "turkey": { cal: 189, p: 29, c: 0, f: 7.4, defaultServing: 150, unit: "g" },
  "salmon": { cal: 208, p: 20, c: 0, f: 13, defaultServing: 150, unit: "g" },
  "tuna": { cal: 116, p: 25.5, c: 0, f: 1, defaultServing: 150, unit: "g" },
  "tuna can": { cal: 116, p: 25.5, c: 0, f: 1, defaultServing: 150, unit: "can" },
  "shrimp": { cal: 99, p: 24, c: 0.2, f: 0.3, defaultServing: 100, unit: "g" },
  "cod": { cal: 82, p: 18, c: 0, f: 0.7, defaultServing: 150, unit: "g" },
  "pork": { cal: 242, p: 27, c: 0, f: 14, defaultServing: 150, unit: "g" },
  "bacon": { cal: 541, p: 37, c: 1.4, f: 42, defaultServing: 45, unit: "slice" },
  "ham": { cal: 145, p: 21, c: 2.5, f: 5.5, defaultServing: 85, unit: "serving" },

  // Grains & Pasta
  "rice": { cal: 130, p: 2.7, c: 28, f: 0.3, defaultServing: 200, unit: "serving" },
  "white rice": { cal: 130, p: 2.7, c: 28, f: 0.3, defaultServing: 200, unit: "serving" },
  "brown rice": { cal: 123, p: 2.7, c: 26, f: 1, defaultServing: 200, unit: "serving" },
  "pasta": { cal: 131, p: 5, c: 25, f: 1.1, defaultServing: 180, unit: "serving" },
  "spaghetti": { cal: 131, p: 5, c: 25, f: 1.1, defaultServing: 180, unit: "serving" },
  "noodles": { cal: 138, p: 4.5, c: 25, f: 2.1, defaultServing: 180, unit: "serving" },
  "oatmeal": { cal: 71, p: 2.5, c: 12, f: 1.5, defaultServing: 250, unit: "bowl" },
  "oats": { cal: 389, p: 17, c: 66, f: 7, defaultServing: 40, unit: "serving" },
  "cereal": { cal: 370, p: 8, c: 80, f: 3, defaultServing: 40, unit: "serving" },
  "granola": { cal: 471, p: 10, c: 64, f: 20, defaultServing: 50, unit: "serving" },
  "quinoa": { cal: 120, p: 4.4, c: 22, f: 1.9, defaultServing: 185, unit: "serving" },
  "couscous": { cal: 112, p: 3.8, c: 23, f: 0.2, defaultServing: 180, unit: "serving" },

  // Vegetables
  "salad": { cal: 20, p: 1.2, c: 3.5, f: 0.3, defaultServing: 100, unit: "serving" },
  "mixed salad": { cal: 20, p: 1.2, c: 3.5, f: 0.3, defaultServing: 100, unit: "serving" },
  "green salad": { cal: 20, p: 1.2, c: 3.5, f: 0.3, defaultServing: 100, unit: "serving" },
  "vegetables": { cal: 35, p: 2, c: 7, f: 0.3, defaultServing: 100, unit: "serving" },
  "broccoli": { cal: 35, p: 2.4, c: 7, f: 0.4, defaultServing: 100, unit: "serving" },
  "spinach": { cal: 23, p: 2.9, c: 3.6, f: 0.4, defaultServing: 100, unit: "serving" },
  "tomato": { cal: 18, p: 0.9, c: 3.9, f: 0.2, defaultServing: 120, unit: "piece" },
  "cucumber": { cal: 16, p: 0.7, c: 3.6, f: 0.1, defaultServing: 100, unit: "serving" },
  "carrot": { cal: 41, p: 0.9, c: 10, f: 0.2, defaultServing: 80, unit: "piece" },
  "potato": { cal: 87, p: 2, c: 20, f: 0.1, defaultServing: 150, unit: "piece" },
  "sweet potato": { cal: 86, p: 1.6, c: 20, f: 0.1, defaultServing: 150, unit: "piece" },
  "bell pepper": { cal: 31, p: 1, c: 6, f: 0.3, defaultServing: 120, unit: "piece" },
  "onion": { cal: 40, p: 1.1, c: 9.3, f: 0.1, defaultServing: 70, unit: "piece" },
  "corn": { cal: 86, p: 3.2, c: 19, f: 1.2, defaultServing: 100, unit: "serving" },
  "avocado": { cal: 160, p: 2, c: 9, f: 15, defaultServing: 100, unit: "piece" },
  "lettuce": { cal: 15, p: 1.4, c: 2.9, f: 0.2, defaultServing: 50, unit: "serving" },

  // Legumes
  "beans": { cal: 127, p: 8.7, c: 23, f: 0.5, defaultServing: 130, unit: "serving" },
  "black beans": { cal: 132, p: 8.9, c: 24, f: 0.5, defaultServing: 130, unit: "serving" },
  "chickpeas": { cal: 164, p: 8.9, c: 27, f: 2.6, defaultServing: 130, unit: "serving" },
  "lentils": { cal: 116, p: 9, c: 20, f: 0.4, defaultServing: 130, unit: "serving" },
  "tofu": { cal: 76, p: 8, c: 1.9, f: 4.8, defaultServing: 100, unit: "serving" },

  // Dairy
  "yogurt": { cal: 59, p: 3.5, c: 5, f: 3.3, defaultServing: 150, unit: "serving" },
  "greek yogurt": { cal: 97, p: 9, c: 6, f: 5, defaultServing: 150, unit: "serving" },
  "cheese": { cal: 402, p: 25, c: 1.3, f: 33, defaultServing: 30, unit: "serving" },
  "cheddar": { cal: 402, p: 25, c: 1.3, f: 33, defaultServing: 30, unit: "serving" },
  "mozzarella": { cal: 280, p: 28, c: 2.2, f: 17, defaultServing: 50, unit: "serving" },
  "cottage cheese": { cal: 98, p: 11.1, c: 3.4, f: 4.3, defaultServing: 110, unit: "serving" },
  "ice cream": { cal: 207, p: 3.5, c: 24, f: 11, defaultServing: 100, unit: "serving" },

  // Fruits
  "apple": { cal: 52, p: 0.3, c: 14, f: 0.2, defaultServing: 180, unit: "piece" },
  "banana": { cal: 89, p: 1.1, c: 23, f: 0.3, defaultServing: 120, unit: "piece" },
  "orange": { cal: 47, p: 0.9, c: 12, f: 0.1, defaultServing: 150, unit: "piece" },
  "strawberries": { cal: 32, p: 0.7, c: 7.7, f: 0.3, defaultServing: 150, unit: "serving" },
  "blueberries": { cal: 57, p: 0.7, c: 14, f: 0.3, defaultServing: 100, unit: "serving" },
  "grapes": { cal: 69, p: 0.7, c: 18, f: 0.2, defaultServing: 100, unit: "serving" },
  "mango": { cal: 60, p: 0.8, c: 15, f: 0.4, defaultServing: 165, unit: "piece" },
  "pineapple": { cal: 50, p: 0.5, c: 13, f: 0.1, defaultServing: 165, unit: "serving" },

  // Fast Food
  "pizza": { cal: 266, p: 11, c: 33, f: 10, defaultServing: 107, unit: "slice" },
  "burger": { cal: 295, p: 17, c: 24, f: 14, defaultServing: 170, unit: "piece" },
  "cheeseburger": { cal: 303, p: 17, c: 26, f: 14, defaultServing: 170, unit: "piece" },
  "fries": { cal: 312, p: 3.4, c: 41, f: 15, defaultServing: 150, unit: "serving" },
  "french fries": { cal: 312, p: 3.4, c: 41, f: 15, defaultServing: 150, unit: "serving" },
  "hot dog": { cal: 290, p: 10, c: 22, f: 17, defaultServing: 100, unit: "piece" },
  "wrap": { cal: 210, p: 14, c: 25, f: 6, defaultServing: 200, unit: "piece" },
  "sandwich": { cal: 250, p: 14, c: 32, f: 7, defaultServing: 200, unit: "piece" },
  "sushi": { cal: 150, p: 6, c: 25, f: 3, defaultServing: 200, unit: "serving" },

  // Snacks
  "chocolate": { cal: 546, p: 5, c: 60, f: 31, defaultServing: 40, unit: "serving" },
  "dark chocolate": { cal: 598, p: 7.8, c: 46, f: 43, defaultServing: 40, unit: "serving" },
  "cookie": { cal: 502, p: 6, c: 66, f: 24, defaultServing: 25, unit: "piece" },
  "chips": { cal: 536, p: 7, c: 53, f: 35, defaultServing: 30, unit: "serving" },
  "nuts": { cal: 607, p: 21, c: 8, f: 54, defaultServing: 30, unit: "serving" },
  "almonds": { cal: 579, p: 21, c: 22, f: 50, defaultServing: 30, unit: "serving" },
  "walnuts": { cal: 654, p: 15, c: 14, f: 65, defaultServing: 30, unit: "serving" },
  "protein bar": { cal: 364, p: 30, c: 40, f: 8, defaultServing: 60, unit: "bar" },
  "rice cake": { cal: 387, p: 8, c: 82, f: 3, defaultServing: 9, unit: "piece" },
  "popcorn": { cal: 375, p: 11, c: 74, f: 4.3, defaultServing: 30, unit: "serving" },

  // Other
  "sugar": { cal: 387, p: 0, c: 100, f: 0, defaultServing: 5, unit: "serving" },
  "soup": { cal: 50, p: 3, c: 8, f: 1, defaultServing: 300, unit: "bowl" },
  "salsa": { cal: 36, p: 1.7, c: 8, f: 0.2, defaultServing: 30, unit: "serving" },
  "hummus": { cal: 177, p: 7.9, c: 20, f: 8.6, defaultServing: 60, unit: "serving" },

  // Branded beverages
  "s.pellegrino": { cal: 0, p: 0, c: 0, f: 0, defaultServing: 500, unit: "bottle" },
  "pellegrino": { cal: 0, p: 0, c: 0, f: 0, defaultServing: 500, unit: "bottle" },
  "coca-cola": { cal: 42, p: 0, c: 10.6, f: 0, defaultServing: 330, unit: "can" },
  "coca cola": { cal: 42, p: 0, c: 10.6, f: 0, defaultServing: 330, unit: "can" },
  "coke": { cal: 42, p: 0, c: 10.6, f: 0, defaultServing: 330, unit: "can" },
  "pepsi": { cal: 41, p: 0, c: 10.3, f: 0, defaultServing: 330, unit: "can" },
  "diet coke": { cal: 0, p: 0, c: 0, f: 0, defaultServing: 330, unit: "can" },
  "zero coke": { cal: 0, p: 0, c: 0, f: 0, defaultServing: 330, unit: "can" },
  "red bull": { cal: 45, p: 0, c: 11, f: 0, defaultServing: 250, unit: "can" },
  "sparkling water": { cal: 0, p: 0, c: 0, f: 0, defaultServing: 500, unit: "bottle" },
  "mineral water": { cal: 0, p: 0, c: 0, f: 0, defaultServing: 500, unit: "bottle" },
  "still water": { cal: 0, p: 0, c: 0, f: 0, defaultServing: 500, unit: "bottle" },
  "beer": { cal: 43, p: 0.5, c: 3.6, f: 0, defaultServing: 330, unit: "can" },
  "wine": { cal: 83, p: 0.1, c: 2.6, f: 0, defaultServing: 150, unit: "glass" },
  "red wine": { cal: 85, p: 0.1, c: 2.6, f: 0, defaultServing: 150, unit: "glass" },
  "white wine": { cal: 82, p: 0.1, c: 2.6, f: 0, defaultServing: 150, unit: "glass" },

  // Italian foods
  "pizza margherita": { cal: 266, p: 11, c: 33, f: 10, defaultServing: 300, unit: "serving" },
  "pizza napoletana": { cal: 270, p: 12, c: 34, f: 10, defaultServing: 300, unit: "serving" },
  "risotto": { cal: 140, p: 4, c: 26, f: 3, defaultServing: 300, unit: "serving" },
  "focaccia": { cal: 295, p: 7, c: 48, f: 9, defaultServing: 100, unit: "serving" },
  "gnocchi": { cal: 130, p: 3, c: 27, f: 0.5, defaultServing: 200, unit: "serving" },
  "lasagna": { cal: 135, p: 8, c: 12, f: 6, defaultServing: 300, unit: "serving" },
  "carbonara": { cal: 220, p: 11, c: 25, f: 9, defaultServing: 300, unit: "serving" },
  "bruschetta": { cal: 220, p: 5.5, c: 35, f: 7, defaultServing: 80, unit: "serving" },
  "mozzarella di bufala": { cal: 260, p: 18, c: 1, f: 20, defaultServing: 125, unit: "serving" },
  "parmesan": { cal: 431, p: 38, c: 3.2, f: 29, defaultServing: 15, unit: "serving" },
  "prosciutto": { cal: 250, p: 29, c: 0, f: 15, defaultServing: 50, unit: "serving" },
  "bresaola": { cal: 151, p: 32, c: 0, f: 2.3, defaultServing: 50, unit: "serving" },
  "salame": { cal: 425, p: 22, c: 1, f: 37, defaultServing: 30, unit: "serving" },
  "salami": { cal: 425, p: 22, c: 1, f: 37, defaultServing: 30, unit: "serving" },
  "tiramisu": { cal: 282, p: 5, c: 23, f: 19, defaultServing: 100, unit: "serving" },
  "gelato": { cal: 207, p: 3.5, c: 26, f: 10, defaultServing: 100, unit: "serving" },
  "cannoli": { cal: 350, p: 7, c: 39, f: 19, defaultServing: 85, unit: "piece" },

  // Asian foods
  "sushi roll": { cal: 150, p: 6, c: 25, f: 3, defaultServing: 200, unit: "serving" },
  "miso soup": { cal: 40, p: 3, c: 5, f: 1.5, defaultServing: 240, unit: "bowl" },
  "ramen": { cal: 436, p: 20, c: 54, f: 14, defaultServing: 400, unit: "bowl" },
  "fried rice": { cal: 163, p: 3.2, c: 25, f: 5.7, defaultServing: 250, unit: "serving" },
  "spring roll": { cal: 154, p: 5, c: 18, f: 6.8, defaultServing: 80, unit: "piece" },
  "pad thai": { cal: 160, p: 8, c: 22, f: 5, defaultServing: 300, unit: "serving" },
  "curry": { cal: 120, p: 8, c: 10, f: 5, defaultServing: 300, unit: "serving" },

  // More vegetables
  "zucchini": { cal: 17, p: 1.2, c: 3.1, f: 0.3, defaultServing: 200, unit: "serving" },
  "courgette": { cal: 17, p: 1.2, c: 3.1, f: 0.3, defaultServing: 200, unit: "serving" },
  "eggplant": { cal: 25, p: 1, c: 5.7, f: 0.2, defaultServing: 150, unit: "serving" },
  "aubergine": { cal: 25, p: 1, c: 5.7, f: 0.2, defaultServing: 150, unit: "serving" },
  "mushroom": { cal: 22, p: 3.1, c: 3.3, f: 0.3, defaultServing: 100, unit: "serving" },
  "mushrooms": { cal: 22, p: 3.1, c: 3.3, f: 0.3, defaultServing: 100, unit: "serving" },
  "garlic": { cal: 149, p: 6.4, c: 33, f: 0.5, defaultServing: 5, unit: "serving" },
  "asparagus": { cal: 20, p: 2.2, c: 3.9, f: 0.1, defaultServing: 100, unit: "serving" },
  "kale": { cal: 49, p: 4.3, c: 9, f: 0.9, defaultServing: 100, unit: "serving" },
  "celery": { cal: 16, p: 0.7, c: 3, f: 0.2, defaultServing: 100, unit: "serving" },
  "cauliflower": { cal: 25, p: 1.9, c: 5, f: 0.3, defaultServing: 150, unit: "serving" },
  "peas": { cal: 81, p: 5.4, c: 14, f: 0.4, defaultServing: 100, unit: "serving" },
  "edamame": { cal: 121, p: 11, c: 8.9, f: 5.2, defaultServing: 100, unit: "serving" },

  // More fruits
  "pear": { cal: 57, p: 0.4, c: 15, f: 0.1, defaultServing: 170, unit: "piece" },
  "peach": { cal: 39, p: 0.9, c: 10, f: 0.3, defaultServing: 150, unit: "piece" },
  "cherry": { cal: 63, p: 1.1, c: 16, f: 0.2, defaultServing: 100, unit: "serving" },
  "cherries": { cal: 63, p: 1.1, c: 16, f: 0.2, defaultServing: 100, unit: "serving" },
  "kiwi": { cal: 61, p: 1.1, c: 15, f: 0.5, defaultServing: 75, unit: "piece" },
  "watermelon": { cal: 30, p: 0.6, c: 7.6, f: 0.2, defaultServing: 300, unit: "serving" },
  "pomegranate": { cal: 83, p: 1.7, c: 19, f: 1.2, defaultServing: 100, unit: "serving" },
  "lemon": { cal: 29, p: 1.1, c: 9.3, f: 0.3, defaultServing: 60, unit: "piece" },
  "raspberry": { cal: 52, p: 1.2, c: 12, f: 0.7, defaultServing: 100, unit: "serving" },
  "raspberries": { cal: 52, p: 1.2, c: 12, f: 0.7, defaultServing: 100, unit: "serving" },

  // More dairy / eggs
  "whey protein": { cal: 380, p: 80, c: 8, f: 4, defaultServing: 30, unit: "scoop" },
  "casein protein": { cal: 370, p: 80, c: 5, f: 3, defaultServing: 30, unit: "scoop" },
  "kefir": { cal: 61, p: 3.3, c: 4.8, f: 3.3, defaultServing: 250, unit: "cup" },
  "feta": { cal: 264, p: 14, c: 4, f: 21, defaultServing: 30, unit: "serving" },
  "butter milk": { cal: 40, p: 3.4, c: 4.8, f: 0.9, defaultServing: 250, unit: "cup" },
  "cream": { cal: 340, p: 2.2, c: 2.8, f: 35, defaultServing: 30, unit: "serving" },
  "sour cream": { cal: 198, p: 2.4, c: 4.3, f: 19, defaultServing: 30, unit: "serving" },

  // Nuts & seeds
  "sunflower seeds": { cal: 584, p: 21, c: 20, f: 51, defaultServing: 28, unit: "serving" },
  "pumpkin seeds": { cal: 446, p: 19, c: 54, f: 19, defaultServing: 28, unit: "serving" },
  "chia seeds": { cal: 486, p: 17, c: 42, f: 31, defaultServing: 15, unit: "serving" },
  "flaxseeds": { cal: 534, p: 18, c: 29, f: 42, defaultServing: 10, unit: "serving" },
  "sesame seeds": { cal: 573, p: 18, c: 23, f: 50, defaultServing: 10, unit: "serving" },
  "tahini": { cal: 595, p: 17, c: 21, f: 54, defaultServing: 15, unit: "serving" },
  "pistachio": { cal: 562, p: 20, c: 28, f: 45, defaultServing: 28, unit: "serving" },
  "pistachios": { cal: 562, p: 20, c: 28, f: 45, defaultServing: 28, unit: "serving" },
  "hazelnut": { cal: 628, p: 15, c: 17, f: 61, defaultServing: 28, unit: "serving" },
  "hazelnuts": { cal: 628, p: 15, c: 17, f: 61, defaultServing: 28, unit: "serving" },
  "pecans": { cal: 691, p: 9.2, c: 14, f: 72, defaultServing: 28, unit: "serving" },
  "macadamia": { cal: 718, p: 8, c: 14, f: 76, defaultServing: 28, unit: "serving" },

  // More grains / breads
  "tortilla": { cal: 218, p: 6, c: 38, f: 5.3, defaultServing: 35, unit: "piece" },
  "wrap tortilla": { cal: 218, p: 6, c: 38, f: 5.3, defaultServing: 60, unit: "piece" },
  "pita bread": { cal: 275, p: 9, c: 55, f: 1.2, defaultServing: 57, unit: "piece" },
  "rye bread": { cal: 259, p: 8.5, c: 48, f: 3.3, defaultServing: 35, unit: "slice" },
  "cornbread": { cal: 232, p: 5, c: 38, f: 7, defaultServing: 60, unit: "slice" },
  "corn tortilla": { cal: 218, p: 5.7, c: 46, f: 2.6, defaultServing: 28, unit: "piece" },
  "naan": { cal: 317, p: 10, c: 57, f: 7, defaultServing: 100, unit: "piece" },
  "muffin": { cal: 375, p: 5, c: 55, f: 15, defaultServing: 100, unit: "piece" },
  "pancake": { cal: 227, p: 6, c: 38, f: 7, defaultServing: 77, unit: "piece" },
  "waffle": { cal: 291, p: 7.9, c: 37, f: 13, defaultServing: 75, unit: "piece" },

  // More proteins / meat
  "lamb": { cal: 294, p: 25, c: 0, f: 21, defaultServing: 150, unit: "g" },
  "duck": { cal: 337, p: 27, c: 0, f: 25, defaultServing: 150, unit: "g" },
  "venison": { cal: 159, p: 26, c: 0, f: 5.2, defaultServing: 150, unit: "g" },
  "lobster": { cal: 89, p: 18, c: 1.1, f: 0.9, defaultServing: 150, unit: "g" },
  "crab": { cal: 97, p: 20, c: 0, f: 1.5, defaultServing: 150, unit: "g" },
  "scallop": { cal: 111, p: 20, c: 5.4, f: 0.8, defaultServing: 100, unit: "g" },
  "sardine": { cal: 208, p: 25, c: 0, f: 11, defaultServing: 100, unit: "g" },
  "sardines": { cal: 208, p: 25, c: 0, f: 11, defaultServing: 100, unit: "g" },
  "mackerel": { cal: 205, p: 19, c: 0, f: 13, defaultServing: 150, unit: "g" },
  "herring": { cal: 158, p: 18, c: 0, f: 9, defaultServing: 100, unit: "g" },
  "anchovies": { cal: 210, p: 29, c: 0, f: 10, defaultServing: 30, unit: "serving" },
  "sausage": { cal: 301, p: 13, c: 3, f: 26, defaultServing: 60, unit: "piece" },
  "hot dog sausage": { cal: 290, p: 10, c: 22, f: 17, defaultServing: 60, unit: "piece" },
  "pepperoni": { cal: 494, p: 20, c: 2.4, f: 44, defaultServing: 30, unit: "serving" },

  // Condiments / extras
  "ketchup": { cal: 112, p: 1.3, c: 27, f: 0.1, defaultServing: 17, unit: "serving" },
  "mayo": { cal: 680, p: 1, c: 0.6, f: 75, defaultServing: 14, unit: "serving" },
  "mayonnaise": { cal: 680, p: 1, c: 0.6, f: 75, defaultServing: 14, unit: "serving" },
  "mustard": { cal: 66, p: 4.4, c: 5.8, f: 3.3, defaultServing: 5, unit: "serving" },
  "bbq sauce": { cal: 120, p: 0.9, c: 29, f: 0.2, defaultServing: 30, unit: "serving" },
  "hot sauce": { cal: 25, p: 0.7, c: 5, f: 0.5, defaultServing: 5, unit: "serving" },
  "soy sauce": { cal: 53, p: 8.1, c: 4.9, f: 0.1, defaultServing: 15, unit: "serving" },
  "vinegar": { cal: 18, p: 0, c: 0.6, f: 0, defaultServing: 15, unit: "serving" },
  "lemon juice": { cal: 22, p: 0.4, c: 7, f: 0.2, defaultServing: 30, unit: "serving" },
  "maple syrup": { cal: 260, p: 0, c: 67, f: 0.1, defaultServing: 20, unit: "serving" },
  "nutella": { cal: 539, p: 6.3, c: 58, f: 31, defaultServing: 20, unit: "serving" },

  // More packaged / branded items (generic)
  "oreo": { cal: 473, p: 5.1, c: 70, f: 19, defaultServing: 34, unit: "serving" },
  "donut": { cal: 452, p: 6.5, c: 51, f: 25, defaultServing: 57, unit: "piece" },
  "doughnut": { cal: 452, p: 6.5, c: 51, f: 25, defaultServing: 57, unit: "piece" },
  "brownie": { cal: 410, p: 5, c: 56, f: 19, defaultServing: 60, unit: "piece" },
  "muesli": { cal: 367, p: 9, c: 65, f: 7, defaultServing: 60, unit: "serving" },
  "cornflakes": { cal: 357, p: 7, c: 84, f: 0.9, defaultServing: 30, unit: "serving" },
  "müsli": { cal: 367, p: 9, c: 65, f: 7, defaultServing: 60, unit: "serving" },

  // Legumes extended
  "edamame beans": { cal: 121, p: 11, c: 8.9, f: 5.2, defaultServing: 100, unit: "serving" },
  "kidney beans": { cal: 127, p: 8.7, c: 23, f: 0.5, defaultServing: 130, unit: "serving" },
  "white beans": { cal: 139, p: 9, c: 25, f: 0.6, defaultServing: 130, unit: "serving" },
  "tempeh": { cal: 193, p: 20, c: 7.6, f: 10.8, defaultServing: 100, unit: "serving" },
  "seitan": { cal: 370, p: 75, c: 14, f: 1.9, defaultServing: 100, unit: "serving" },
};

const QUANTITY_WORDS: Record<string, number> = {
  "a": 1, "an": 1, "one": 1, "two": 2, "three": 3, "four": 4,
  "five": 5, "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10,
  "half": 0.5, "quarter": 0.25, "a couple": 2, "couple": 2,
  "a few": 3, "few": 3, "small": 0.75, "large": 1.5, "big": 1.5,
  "medium": 1, "small portion": 0.75, "large portion": 1.5,
};

const UNIT_ALIASES: Record<string, string> = {
  "g": "g", "gr": "g", "gram": "g", "grams": "g",
  "kg": "kg", "kilogram": "kg", "kilograms": "kg",
  "ml": "ml", "milliliter": "ml", "milliliters": "ml",
  "l": "l", "liter": "l", "liters": "l", "litre": "l", "litres": "l",
  "cup": "cup", "cups": "cup",
  "tbsp": "tbsp", "tablespoon": "tbsp", "tablespoons": "tbsp",
  "tsp": "tsp", "teaspoon": "tsp", "teaspoons": "tsp",
  "oz": "oz", "ounce": "oz", "ounces": "oz",
  "slice": "slice", "slices": "slice",
  "piece": "piece", "pieces": "piece",
  "serving": "serving", "servings": "serving",
  "can": "can", "cans": "can",
  "bowl": "bowl", "bowls": "bowl",
  "bar": "bar", "bars": "bar",
  "glass": "glass", "glasses": "glass",
};

const UNIT_TO_GRAMS: Record<string, number> = {
  "g": 1, "ml": 1, "kg": 1000, "l": 1000,
  "cup": 240, "tbsp": 15, "tsp": 5, "oz": 28.35,
  "slice": 35, "piece": 0, "serving": 0, "can": 0,
  "bowl": 0, "bar": 0, "glass": 0,
};

function normalizeText(text: string): string {
  return text.toLowerCase().replace(/[,;]/g, " and ").replace(/\s+/g, " ").trim();
}

function extractQuantity(segment: string): { quantity: number; remaining: string } {
  // Match decimal/fraction numbers
  const numMatch = segment.match(/^(\d+(?:\.\d+)?(?:\/\d+)?)\s*(.*)/);
  if (numMatch) {
    let qty = parseFloat(numMatch[1]);
    if (numMatch[1].includes("/")) {
      const parts = numMatch[1].split("/");
      qty = parseFloat(parts[0]) / parseFloat(parts[1]);
    }
    return { quantity: qty, remaining: numMatch[2].trim() };
  }

  // Match word quantities
  for (const [word, val] of Object.entries(QUANTITY_WORDS)) {
    const regex = new RegExp(`^${word}\\s+`, "i");
    if (regex.test(segment)) {
      return { quantity: val, remaining: segment.replace(regex, "").trim() };
    }
  }

  return { quantity: 1, remaining: segment };
}

function extractUnit(segment: string): { unit: string | null; remaining: string } {
  const words = segment.split(/\s+/);
  if (words.length === 0) return { unit: null, remaining: segment };

  const firstWord = words[0].toLowerCase();
  if (UNIT_ALIASES[firstWord]) {
    return { unit: UNIT_ALIASES[firstWord], remaining: words.slice(1).join(" ").trim() };
  }

  // Check two-word units like "table spoon"
  if (words.length >= 2) {
    const twoWords = `${words[0]} ${words[1]}`.toLowerCase();
    if (UNIT_ALIASES[twoWords]) {
      return { unit: UNIT_ALIASES[twoWords], remaining: words.slice(2).join(" ").trim() };
    }
  }

  // Check for "of" skip: "2 slices of bread" -> skip "of"
  if (firstWord === "of" && words.length > 1) {
    return { unit: null, remaining: words.slice(1).join(" ").trim() };
  }

  return { unit: null, remaining: segment };
}

function findFood(name: string): { key: string; food: FoodEstimate } | null {
  const normalized = name.toLowerCase().trim();

  // Exact match
  if (FOOD_DB[normalized]) {
    return { key: normalized, food: FOOD_DB[normalized] };
  }

  // Try removing trailing 's' (plurals)
  const singular = normalized.endsWith("s") ? normalized.slice(0, -1) : normalized;
  if (FOOD_DB[singular]) {
    return { key: singular, food: FOOD_DB[singular] };
  }

  // Partial match - find longest key that appears in the food name
  let bestMatch: { key: string; food: FoodEstimate } | null = null;
  let bestLen = 0;
  for (const [key, food] of Object.entries(FOOD_DB)) {
    if (normalized.includes(key) && key.length > bestLen) {
      bestMatch = { key, food };
      bestLen = key.length;
    }
  }
  if (bestMatch) return bestMatch;

  // Check if any word in normalized matches a key
  const words = normalized.split(/\s+/);
  for (const word of words) {
    if (FOOD_DB[word]) {
      return { key: word, food: FOOD_DB[word] };
    }
    const singularWord = word.endsWith("s") ? word.slice(0, -1) : word;
    if (FOOD_DB[singularWord]) {
      return { key: singularWord, food: FOOD_DB[singularWord] };
    }
  }

  return null;
}

function calcNutrition(
  food: FoodEstimate,
  quantity: number,
  unit: string | null,
): { calories: number; proteinG: number; carbsG: number; fatG: number; servingGrams: number } {
  let totalGrams: number;

  if (unit && unit in UNIT_TO_GRAMS) {
    const gramsPerUnit = UNIT_TO_GRAMS[unit];
    if (gramsPerUnit === 0) {
      // Use defaultServing
      totalGrams = food.defaultServing * quantity;
    } else if (unit === "kg") {
      totalGrams = gramsPerUnit * quantity;
    } else if (unit === "l") {
      totalGrams = gramsPerUnit * quantity;
    } else {
      totalGrams = gramsPerUnit * quantity;
    }
  } else {
    // No unit — use default serving * quantity
    totalGrams = food.defaultServing * quantity;
  }

  const factor = totalGrams / 100;
  return {
    calories: Math.round(food.cal * factor),
    proteinG: Math.round(food.p * factor * 10) / 10,
    carbsG: Math.round(food.c * factor * 10) / 10,
    fatG: Math.round(food.f * factor * 10) / 10,
    servingGrams: Math.round(totalGrams),
  };
}

function splitMealText(text: string): string[] {
  // Split by: comma, "and", "&", "+", newline, semicolon
  return text
    .split(/,|;|\band\b|&|\+|\n/)
    .map((s) => s.trim())
    .filter((s) => s.length > 1);
}

export function parseMealDescription(text: string): ParsedFoodItem[] {
  const normalized = normalizeText(text);
  const segments = splitMealText(normalized);
  const results: ParsedFoodItem[] = [];

  for (const segment of segments) {
    if (!segment) continue;

    // Extract quantity
    const { quantity, remaining: afterQty } = extractQuantity(segment);

    // Extract unit
    const { unit, remaining: foodName } = extractUnit(afterQty);

    if (!foodName) continue;

    // Find food
    const match = findFood(foodName);
    if (!match) continue;

    const { key, food } = match;
    const nutrition = calcNutrition(food, quantity, unit);

    if (nutrition.calories === 0 && key === "water") continue; // skip water

    // Create display name
    let displayName = key.charAt(0).toUpperCase() + key.slice(1);
    if (quantity !== 1 || unit) {
      const qtyStr = quantity % 1 === 0 ? quantity.toString() : quantity.toFixed(1);
      const unitStr = unit ? ` ${unit}` : "";
      displayName = `${qtyStr}${unitStr} ${displayName}`;
    }

    results.push({
      name: key,
      displayName,
      quantity,
      unit: unit || food.unit,
      servingGrams: nutrition.servingGrams,
      calories: nutrition.calories,
      proteinG: nutrition.proteinG,
      carbsG: nutrition.carbsG,
      fatG: nutrition.fatG,
      isEstimate: true,
    });
  }

  return results;
}

export function getTotalNutrition(items: ParsedFoodItem[]) {
  return items.reduce(
    (acc, item) => ({
      calories: acc.calories + item.calories,
      proteinG: acc.proteinG + item.proteinG,
      carbsG: acc.carbsG + item.carbsG,
      fatG: acc.fatG + item.fatG,
    }),
    { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 }
  );
}
