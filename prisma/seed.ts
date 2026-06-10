import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const foods = [
  // ── Grains & Carbs ──────────────────────────────────────────────────────────
  { name: "Rolled Oats", brand: "Generic", calories: 389, proteinG: 16.9, carbsG: 66.3, fatG: 6.9, fiberG: 10.6, sugarG: 1.1, servingSize: 100, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Fiocchi d\'avena","de":"Haferflocken","es":"Copos de avena","fr":"Flocons d\'avoine"}' },
  { name: "White Rice (cooked)", brand: "Generic", calories: 130, proteinG: 2.7, carbsG: 28.2, fatG: 0.3, fiberG: 0.4, sugarG: 0.1, servingSize: 100, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Riso bianco (cotto)","de":"Weißer Reis (gekocht)","es":"Arroz blanco (cocido)","fr":"Riz blanc (cuit)"}' },
  { name: "Brown Rice (cooked)", brand: "Generic", calories: 112, proteinG: 2.6, carbsG: 23.5, fatG: 0.9, fiberG: 1.8, sugarG: 0.4, servingSize: 100, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Riso integrale (cotto)","de":"Brauner Reis (gekocht)","es":"Arroz integral (cocido)","fr":"Riz complet (cuit)"}' },
  { name: "Whole Wheat Bread", brand: "Generic", calories: 74, proteinG: 3.9, carbsG: 12.4, fatG: 1, fiberG: 1.8, sugarG: 1.7, servingSize: 30, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Pane integrale","de":"Vollkornbrot","es":"Pan integral","fr":"Pain complet"}' },
  { name: "White Bread", brand: "Generic", calories: 80, proteinG: 2.7, carbsG: 14.7, fatG: 1, fiberG: 0.8, sugarG: 1.5, servingSize: 30, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Pane bianco","de":"Weißbrot","es":"Pan blanco","fr":"Pain blanc"}' },
  { name: "Pasta (cooked)", brand: "Generic", calories: 158, proteinG: 5.8, carbsG: 30.9, fatG: 0.9, fiberG: 1.8, sugarG: 0.6, servingSize: 100, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Pasta (cotta)","de":"Nudeln (gekocht)","es":"Pasta (cocida)","fr":"Pâtes (cuites)"}' },
  { name: "Quinoa (cooked)", brand: "Generic", calories: 120, proteinG: 4.4, carbsG: 21.3, fatG: 1.9, fiberG: 2.8, sugarG: 0.9, servingSize: 100, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Quinoa (cotta)","de":"Quinoa (gekocht)","es":"Quinoa (cocida)","fr":"Quinoa (cuit)"}' },
  { name: "Sweet Potato (baked)", brand: "Generic", calories: 90, proteinG: 2.0, carbsG: 20.7, fatG: 0.1, fiberG: 3.3, sugarG: 4.2, servingSize: 100, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Patata dolce (al forno)","de":"Süßkartoffel (gebacken)","es":"Batata (horneada)","fr":"Patate douce (cuite)"}' },
  { name: "Corn (cooked)", brand: "Generic", calories: 96, proteinG: 3.4, carbsG: 21.0, fatG: 1.5, fiberG: 2.4, sugarG: 3.2, servingSize: 100, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Mais (cotto)","de":"Mais (gekocht)","es":"Maíz (cocido)","fr":"Maïs (cuit)"}' },
  { name: "Tortilla (wheat)", brand: "Generic", calories: 140, proteinG: 3.6, carbsG: 23.4, fatG: 3.5, fiberG: 1.6, sugarG: 1, servingSize: 45, servingUnit: "g", source: "seed" },
  { name: "Bagel (plain)", brand: "Generic", calories: 245, proteinG: 9.0, carbsG: 48.0, fatG: 1.5, fiberG: 2.1, sugarG: 5.0, servingSize: 98, servingUnit: "g", source: "seed" },
  { name: "Croissant", brand: "Generic", calories: 231, proteinG: 4.7, carbsG: 26.1, fatG: 12, fiberG: 1.2, sugarG: 6, servingSize: 57, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Cornetto","de":"Croissant","es":"Croissant","fr":"Croissant"}' },
  { name: "Couscous (cooked)", brand: "Generic", calories: 112, proteinG: 3.8, carbsG: 23.2, fatG: 0.2, fiberG: 1.4, sugarG: 0.1, servingSize: 100, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Couscous (cotto)","de":"Couscous (gekocht)","es":"Cuscús (cocido)","fr":"Couscous (cuit)"}' },
  { name: "Polenta (cooked)", brand: "Generic", calories: 70, proteinG: 1.6, carbsG: 15.6, fatG: 0.4, fiberG: 1.0, sugarG: 0.3, servingSize: 100, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Polenta (cotta)","de":"Polenta (gekocht)","es":"Polenta (cocida)","fr":"Polenta (cuite)"}' },

  // ── Proteins ─────────────────────────────────────────────────────────────────
  { name: "Chicken Breast (grilled)", brand: "Generic", calories: 165, proteinG: 31.0, carbsG: 0.0, fatG: 3.6, sugarG: 0.0, servingSize: 100, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Petto di pollo (grigliato)","de":"Hähnchenbrust (gegrillt)","es":"Pechuga de pollo (a la plancha)","fr":"Blanc de poulet (grillé)"}' },
  { name: "Salmon (baked)", brand: "Generic", calories: 208, proteinG: 28.0, carbsG: 0.0, fatG: 10.5, sugarG: 0.0, servingSize: 100, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Salmone (al forno)","de":"Lachs (gebacken)","es":"Salmón (horneado)","fr":"Saumon (cuit)"}' },
  { name: "Tuna (canned in water)", brand: "Generic", calories: 109, proteinG: 25.5, carbsG: 0.0, fatG: 0.5, sugarG: 0.0, servingSize: 100, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Tonno (in acqua)","de":"Thunfisch (in Wasser)","es":"Atún (en agua)","fr":"Thon (en eau)"}' },
  { name: "Eggs (large)", brand: "Generic", calories: 72, proteinG: 6.3, carbsG: 0.4, fatG: 4.8, sugarG: 0.4, servingSize: 50, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Uova (grandi)","de":"Eier (groß)","es":"Huevos (grandes)","fr":"Œufs (gros)"}' },
  { name: "Egg Whites", brand: "Generic", calories: 52, proteinG: 10.9, carbsG: 0.7, fatG: 0.2, sugarG: 0.7, servingSize: 100, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Albumi d\'uovo","de":"Eiweiß","es":"Claras de huevo","fr":"Blancs d\'œufs"}' },
  { name: "Ground Beef (lean, 93%)", brand: "Generic", calories: 218, proteinG: 26.1, carbsG: 0.0, fatG: 12.2, sugarG: 0.0, servingSize: 100, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Carne macinata (magra)","de":"Hackfleisch (mager)","es":"Carne picada (magra)","fr":"Viande hachée (maigre)"}' },
  { name: "Turkey Breast (sliced)", brand: "Generic", calories: 135, proteinG: 30.1, carbsG: 0.0, fatG: 1.0, sugarG: 0.0, servingSize: 100, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Petto di tacchino","de":"Putenbrust","es":"Pechuga de pavo","fr":"Blanc de dinde"}' },
  { name: "Shrimp (cooked)", brand: "Generic", calories: 99, proteinG: 24.0, carbsG: 0.0, fatG: 0.3, sugarG: 0.0, servingSize: 100, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Gamberetti (cotti)","de":"Garnelen (gekocht)","es":"Gambas (cocidas)","fr":"Crevettes (cuites)"}' },
  { name: "Beef Steak (sirloin)", brand: "Generic", calories: 207, proteinG: 26.5, carbsG: 0.0, fatG: 11.0, sugarG: 0.0, servingSize: 100, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Bistecca di manzo","de":"Rindersteaks","es":"Filete de ternera","fr":"Steak de bœuf"}' },
  { name: "Pork Tenderloin", brand: "Generic", calories: 143, proteinG: 22.0, carbsG: 0.0, fatG: 5.5, sugarG: 0.0, servingSize: 100, servingUnit: "g", source: "seed" },
  { name: "Cod (baked)", brand: "Generic", calories: 105, proteinG: 23.0, carbsG: 0.0, fatG: 0.9, sugarG: 0.0, servingSize: 100, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Merluzzo (al forno)","de":"Kabeljau (gebacken)","es":"Bacalao (horneado)","fr":"Cabillaud (cuit)"}' },
  { name: "Sardines (canned in oil)", brand: "Generic", calories: 208, proteinG: 24.6, carbsG: 0.0, fatG: 11.5, sugarG: 0.0, servingSize: 100, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Sardine (sott\'olio)","de":"Sardinen (in Öl)","es":"Sardinas (en aceite)","fr":"Sardines (à l\'huile)"}' },
  { name: "Chicken Thigh (bone-in)", brand: "Generic", calories: 209, proteinG: 26.0, carbsG: 0.0, fatG: 11.8, sugarG: 0.0, servingSize: 100, servingUnit: "g", source: "seed" },
  { name: "Tofu (firm)", brand: "Generic", calories: 76, proteinG: 8.1, carbsG: 1.9, fatG: 4.3, fiberG: 0.3, sugarG: 0.6, servingSize: 100, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Tofu (compatto)","de":"Tofu (fest)","es":"Tofu (firme)","fr":"Tofu (ferme)"}' },
  { name: "Lentils (cooked)", brand: "Generic", calories: 116, proteinG: 9.0, carbsG: 20.1, fatG: 0.4, fiberG: 7.9, sugarG: 1.8, servingSize: 100, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Lenticchie (cotte)","de":"Linsen (gekocht)","es":"Lentejas (cocidas)","fr":"Lentilles (cuites)"}' },
  { name: "Chickpeas (cooked)", brand: "Generic", calories: 164, proteinG: 8.9, carbsG: 27.4, fatG: 2.6, fiberG: 7.6, sugarG: 4.8, servingSize: 100, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Ceci (cotti)","de":"Kichererbsen (gekocht)","es":"Garbanzos (cocidos)","fr":"Pois chiches (cuits)"}' },
  { name: "Black Beans (cooked)", brand: "Generic", calories: 132, proteinG: 8.9, carbsG: 23.7, fatG: 0.5, fiberG: 8.7, sugarG: 0.3, servingSize: 100, servingUnit: "g", source: "seed" },
  { name: "Whey Protein Powder", brand: "Generic", calories: 120, proteinG: 24.0, carbsG: 3.0, fatG: 1.5, sugarG: 2.0, servingSize: 30, servingUnit: "g", source: "seed" },

  // ── Dairy ────────────────────────────────────────────────────────────────────
  { name: "Greek Yogurt (plain, 0%)", brand: "Generic", calories: 59, proteinG: 10.0, carbsG: 3.6, fatG: 0.4, sugarG: 3.6, servingSize: 100, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Yogurt greco (magro)","de":"Griechischer Joghurt (mager)","es":"Yogur griego (0%)","fr":"Yaourt grec (0%)"}' },
  { name: "Whole Milk", brand: "Generic", calories: 61, proteinG: 3.2, carbsG: 4.8, fatG: 3.3, sugarG: 4.8, servingSize: 100, servingUnit: "ml", source: "seed", nameTranslations: '{"it":"Latte intero","de":"Vollmilch","es":"Leche entera","fr":"Lait entier"}' },
  { name: "Skim Milk", brand: "Generic", calories: 34, proteinG: 3.4, carbsG: 5.0, fatG: 0.1, sugarG: 5.0, servingSize: 100, servingUnit: "ml", source: "seed", nameTranslations: '{"it":"Latte scremato","de":"Magermilch","es":"Leche desnatada","fr":"Lait écrémé"}' },
  { name: "Cottage Cheese (low fat)", brand: "Generic", calories: 81, proteinG: 11.1, carbsG: 3.4, fatG: 1.2, sugarG: 2.8, servingSize: 100, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Fiocchi di latte","de":"Hüttenkäse","es":"Requesón","fr":"Fromage cottage"}' },
  { name: "Cheddar Cheese", brand: "Generic", calories: 121, proteinG: 7.5, carbsG: 0.4, fatG: 9.9, sugarG: 0.2, servingSize: 30, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Formaggio Cheddar","de":"Cheddar-Käse","es":"Queso cheddar","fr":"Fromage cheddar"}' },
  { name: "Mozzarella", brand: "Generic", calories: 280, proteinG: 28.0, carbsG: 2.2, fatG: 17.1, sugarG: 1.0, servingSize: 100, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Mozzarella","de":"Mozzarella","es":"Mozzarella","fr":"Mozzarella"}' },
  { name: "Parmesan (grated)", brand: "Generic", calories: 121, proteinG: 10.8, carbsG: 1.1, fatG: 8, sugarG: 0.3, servingSize: 28, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Parmigiano Reggiano","de":"Parmesan","es":"Parmesano","fr":"Parmesan"}' },
  { name: "Butter", brand: "Generic", calories: 100, proteinG: 0.1, carbsG: 0, fatG: 11.4, sugarG: 0, servingSize: 14, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Burro","de":"Butter","es":"Mantequilla","fr":"Beurre"}' },
  { name: "Cream Cheese", brand: "Generic", calories: 96, proteinG: 1.7, carbsG: 1.1, fatG: 9.6, sugarG: 1, servingSize: 28, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Formaggio spalmabile","de":"Frischkäse","es":"Queso crema","fr":"Fromage frais"}' },
  { name: "Heavy Cream", brand: "Generic", calories: 102, proteinG: 0.6, carbsG: 0.8, fatG: 10.8, sugarG: 0.8, servingSize: 30, servingUnit: "ml", source: "seed" },
  { name: "Natural Yogurt (whole)", brand: "Generic", calories: 61, proteinG: 3.5, carbsG: 4.7, fatG: 3.3, sugarG: 4.7, servingSize: 100, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Yogurt naturale (intero)","de":"Naturjoghurt (Vollmilch)","es":"Yogur natural (entero)","fr":"Yaourt nature (entier)"}' },

  // ── Fruits ──────────────────────────────────────────────────────────────────
  { name: "Apple (medium)", brand: "Generic", calories: 95, proteinG: 0.5, carbsG: 25.1, fatG: 0.3, fiberG: 4.4, sugarG: 18.9, servingSize: 182, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Mela (media)","de":"Apfel (mittel)","es":"Manzana (mediana)","fr":"Pomme (moyenne)"}' },
  { name: "Banana (medium)", brand: "Generic", calories: 105, proteinG: 1.3, carbsG: 27.0, fatG: 0.4, fiberG: 3.1, sugarG: 14.4, servingSize: 118, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Banana (media)","de":"Banane (mittel)","es":"Plátano (mediano)","fr":"Banane (moyenne)"}' },
  { name: "Orange (medium)", brand: "Generic", calories: 62, proteinG: 1.2, carbsG: 15.4, fatG: 0.2, fiberG: 3.1, sugarG: 12.2, servingSize: 131, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Arancia (media)","de":"Orange (mittel)","es":"Naranja (mediana)","fr":"Orange (moyenne)"}' },
  { name: "Strawberries", brand: "Generic", calories: 32, proteinG: 0.7, carbsG: 7.7, fatG: 0.3, fiberG: 2.0, sugarG: 4.9, servingSize: 100, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Fragole","de":"Erdbeeren","es":"Fresas","fr":"Fraises"}' },
  { name: "Blueberries", brand: "Generic", calories: 57, proteinG: 0.7, carbsG: 14.5, fatG: 0.3, fiberG: 2.4, sugarG: 9.96, servingSize: 100, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Mirtilli","de":"Blaubeeren","es":"Arándanos","fr":"Myrtilles"}' },
  { name: "Mango", brand: "Generic", calories: 60, proteinG: 0.8, carbsG: 15.0, fatG: 0.4, fiberG: 1.6, sugarG: 13.7, servingSize: 100, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Mango","de":"Mango","es":"Mango","fr":"Mangue"}' },
  { name: "Grapes", brand: "Generic", calories: 69, proteinG: 0.7, carbsG: 18.1, fatG: 0.2, fiberG: 0.9, sugarG: 15.5, servingSize: 100, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Uva","de":"Weintrauben","es":"Uvas","fr":"Raisins"}' },
  { name: "Avocado (half)", brand: "Generic", calories: 161, proteinG: 2.0, carbsG: 8.6, fatG: 14.7, fiberG: 6.7, sugarG: 0.7, servingSize: 100, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Avocado (metà)","de":"Avocado (halb)","es":"Aguacate (mitad)","fr":"Avocat (demi)"}' },
  { name: "Pear (medium)", brand: "Generic", calories: 57, proteinG: 0.4, carbsG: 15.2, fatG: 0.1, fiberG: 3.1, sugarG: 9.8, servingSize: 100, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Pera (media)","de":"Birne (mittel)","es":"Pera (mediana)","fr":"Poire (moyenne)"}' },
  { name: "Pineapple (fresh)", brand: "Generic", calories: 50, proteinG: 0.5, carbsG: 13.1, fatG: 0.1, fiberG: 1.4, sugarG: 9.9, servingSize: 100, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Ananas (fresco)","de":"Ananas (frisch)","es":"Piña (fresca)","fr":"Ananas (frais)"}' },
  { name: "Watermelon", brand: "Generic", calories: 30, proteinG: 0.6, carbsG: 7.6, fatG: 0.2, fiberG: 0.4, sugarG: 6.2, servingSize: 100, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Anguria","de":"Wassermelone","es":"Sandía","fr":"Pastèque"}' },
  { name: "Kiwi", brand: "Generic", calories: 61, proteinG: 1.1, carbsG: 14.7, fatG: 0.5, fiberG: 3.0, sugarG: 9.0, servingSize: 100, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Kiwi","de":"Kiwi","es":"Kiwi","fr":"Kiwi"}' },
  { name: "Lemon", brand: "Generic", calories: 17, proteinG: 0.6, carbsG: 5.4, fatG: 0.2, fiberG: 1.6, sugarG: 1.5, servingSize: 58, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Limone","de":"Zitrone","es":"Limón","fr":"Citron"}' },

  // ── Vegetables ──────────────────────────────────────────────────────────────
  { name: "Broccoli (steamed)", brand: "Generic", calories: 35, proteinG: 2.4, carbsG: 7.2, fatG: 0.4, fiberG: 3.3, sugarG: 1.7, servingSize: 100, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Broccoli (al vapore)","de":"Brokkoli (gedünstet)","es":"Brócoli (al vapor)","fr":"Brocoli (vapeur)"}' },
  { name: "Spinach (raw)", brand: "Generic", calories: 23, proteinG: 2.9, carbsG: 3.6, fatG: 0.4, fiberG: 2.2, sugarG: 0.4, servingSize: 100, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Spinaci (crudi)","de":"Spinat (roh)","es":"Espinacas (crudas)","fr":"Épinards (crus)"}' },
  { name: "Carrots (raw)", brand: "Generic", calories: 41, proteinG: 0.9, carbsG: 9.6, fatG: 0.2, fiberG: 2.8, sugarG: 4.7, servingSize: 100, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Carote (crude)","de":"Karotten (roh)","es":"Zanahorias (crudas)","fr":"Carottes (crues)"}' },
  { name: "Tomatoes (fresh)", brand: "Generic", calories: 18, proteinG: 0.9, carbsG: 3.9, fatG: 0.2, fiberG: 1.2, sugarG: 2.6, servingSize: 100, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Pomodori (freschi)","de":"Tomaten (frisch)","es":"Tomates (frescos)","fr":"Tomates (fraîches)"}' },
  { name: "Potatoes (boiled)", brand: "Generic", calories: 87, proteinG: 1.9, carbsG: 20.1, fatG: 0.1, fiberG: 1.8, sugarG: 0.9, servingSize: 100, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Patate (bollite)","de":"Kartoffeln (gekocht)","es":"Patatas (hervidas)","fr":"Pommes de terre (bouillies)"}' },
  { name: "Cucumber", brand: "Generic", calories: 16, proteinG: 0.7, carbsG: 3.6, fatG: 0.1, fiberG: 0.5, sugarG: 1.7, servingSize: 100, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Cetriolo","de":"Gurke","es":"Pepino","fr":"Concombre"}' },
  { name: "Bell Pepper (red)", brand: "Generic", calories: 31, proteinG: 1.0, carbsG: 6.0, fatG: 0.3, fiberG: 2.1, sugarG: 4.2, servingSize: 100, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Peperone rosso","de":"Rote Paprika","es":"Pimiento rojo","fr":"Poivron rouge"}' },
  { name: "Zucchini", brand: "Generic", calories: 17, proteinG: 1.2, carbsG: 3.1, fatG: 0.3, fiberG: 1.0, sugarG: 2.5, servingSize: 100, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Zucchine","de":"Zucchini","es":"Calabacín","fr":"Courgette"}' },
  { name: "Onion", brand: "Generic", calories: 40, proteinG: 1.1, carbsG: 9.3, fatG: 0.1, fiberG: 1.7, sugarG: 4.2, servingSize: 100, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Cipolla","de":"Zwiebel","es":"Cebolla","fr":"Oignon"}' },
  { name: "Garlic", brand: "Generic", calories: 15, proteinG: 0.6, carbsG: 3.3, fatG: 0.1, fiberG: 0.2, sugarG: 0.1, servingSize: 10, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Aglio","de":"Knoblauch","es":"Ajo","fr":"Ail"}' },
  { name: "Mixed Salad Greens", brand: "Generic", calories: 20, proteinG: 1.5, carbsG: 3.5, fatG: 0.3, fiberG: 1.8, sugarG: 1.2, servingSize: 100, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Insalata mista","de":"Salatmischung","es":"Ensalada mixta","fr":"Salade mélangée"}' },
  { name: "Mushrooms (fresh)", brand: "Generic", calories: 22, proteinG: 3.1, carbsG: 3.3, fatG: 0.3, fiberG: 1.0, sugarG: 1.7, servingSize: 100, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Funghi (freschi)","de":"Pilze (frisch)","es":"Champiñones (frescos)","fr":"Champignons (frais)"}' },
  { name: "Asparagus", brand: "Generic", calories: 20, proteinG: 2.2, carbsG: 3.9, fatG: 0.1, fiberG: 2.1, sugarG: 1.9, servingSize: 100, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Asparagi","de":"Spargel","es":"Espárragos","fr":"Asperges"}' },
  { name: "Eggplant", brand: "Generic", calories: 25, proteinG: 1.0, carbsG: 5.9, fatG: 0.2, fiberG: 3.0, sugarG: 3.5, servingSize: 100, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Melanzane","de":"Aubergine","es":"Berenjena","fr":"Aubergine"}' },

  // ── Fats & Nuts ──────────────────────────────────────────────────────────────
  { name: "Olive Oil", brand: "Generic", calories: 124, proteinG: 0, carbsG: 0, fatG: 14, sugarG: 0, servingSize: 14, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Olio d\'oliva","de":"Olivenöl","es":"Aceite de oliva","fr":"Huile d\'olive"}' },
  { name: "Almonds", brand: "Generic", calories: 162, proteinG: 5.9, carbsG: 6, fatG: 14, fiberG: 3.5, sugarG: 1.2, servingSize: 28, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Mandorle","de":"Mandeln","es":"Almendras","fr":"Amandes"}' },
  { name: "Walnuts", brand: "Generic", calories: 183, proteinG: 4.3, carbsG: 3.8, fatG: 18.3, fiberG: 1.9, sugarG: 0.7, servingSize: 28, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Noci","de":"Walnüsse","es":"Nueces","fr":"Noix"}' },
  { name: "Peanut Butter (natural)", brand: "Generic", calories: 188, proteinG: 8, carbsG: 6.4, fatG: 16.1, fiberG: 1.9, sugarG: 2.7, servingSize: 32, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Burro di arachidi","de":"Erdnussbutter","es":"Crema de cacahuete","fr":"Beurre de cacahuète"}' },
  { name: "Cashews", brand: "Generic", calories: 155, proteinG: 5.1, carbsG: 8.5, fatG: 12.3, fiberG: 0.9, sugarG: 1.7, servingSize: 28, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Anacardi","de":"Cashewnüsse","es":"Anacardos","fr":"Noix de cajou"}' },
  { name: "Peanuts", brand: "Generic", calories: 159, proteinG: 7.2, carbsG: 4.5, fatG: 13.8, fiberG: 2.4, sugarG: 1.3, servingSize: 28, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Arachidi","de":"Erdnüsse","es":"Cacahuetes","fr":"Cacahuètes"}' },
  { name: "Sunflower Seeds", brand: "Generic", calories: 164, proteinG: 5.8, carbsG: 5.6, fatG: 14.4, fiberG: 2.4, sugarG: 0.7, servingSize: 28, servingUnit: "g", source: "seed" },
  { name: "Coconut Oil", brand: "Generic", calories: 121, proteinG: 0, carbsG: 0, fatG: 14, sugarG: 0, servingSize: 14, servingUnit: "g", source: "seed" },
  { name: "Sesame Seeds", brand: "Generic", calories: 86, proteinG: 2.7, carbsG: 3.5, fatG: 7.5, fiberG: 1.8, sugarG: 0, servingSize: 15, servingUnit: "g", source: "seed" },
  { name: "Flaxseeds", brand: "Generic", calories: 80, proteinG: 2.7, carbsG: 4.3, fatG: 6.3, fiberG: 4.1, sugarG: 0.2, servingSize: 15, servingUnit: "g", source: "seed" },

  // ── Italian Foods ─────────────────────────────────────────────────────────────
  { name: "Pizza Margherita", brand: "Generic", calories: 266, proteinG: 11.0, carbsG: 33.0, fatG: 10.0, fiberG: 2.3, sugarG: 3.6, servingSize: 100, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Pizza Margherita","de":"Pizza Margherita","es":"Pizza Margarita","fr":"Pizza Margherita"}' },
  { name: "Risotto (plain)", brand: "Generic", calories: 166, proteinG: 3.3, carbsG: 28.6, fatG: 4.4, fiberG: 0.4, sugarG: 0.3, servingSize: 100, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Risotto (in bianco)","de":"Risotto","es":"Risotto","fr":"Risotto"}' },
  { name: "Focaccia", brand: "Generic", calories: 299, proteinG: 7.4, carbsG: 45.2, fatG: 9.8, fiberG: 2.0, sugarG: 1.8, servingSize: 100, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Focaccia","de":"Focaccia","es":"Focaccia","fr":"Focaccia"}' },
  { name: "Tiramisu", brand: "Generic", calories: 283, proteinG: 5.3, carbsG: 26.7, fatG: 17.1, sugarG: 19.8, servingSize: 100, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Tiramisù","de":"Tiramisu","es":"Tiramisú","fr":"Tiramisu"}' },
  { name: "Prosciutto Crudo", brand: "Generic", calories: 90, proteinG: 13, carbsG: 0.2, fatG: 4.1, sugarG: 0.2, servingSize: 50, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Prosciutto crudo","de":"Schinken (roh)","es":"Jamón crudo","fr":"Jambon cru"}' },
  { name: "Gnocchi (potato)", brand: "Generic", calories: 131, proteinG: 2.9, carbsG: 25.6, fatG: 1.8, fiberG: 1.6, sugarG: 0.6, servingSize: 100, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Gnocchi di patate","de":"Gnocchi","es":"Ñoquis","fr":"Gnocchis"}' },
  { name: "Bruschetta", brand: "Generic", calories: 190, proteinG: 4.8, carbsG: 27.0, fatG: 7.5, fiberG: 2.0, sugarG: 2.8, servingSize: 100, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Bruschetta","de":"Bruschetta","es":"Bruschetta","fr":"Bruschetta"}' },
  { name: "Gelato (vanilla)", brand: "Generic", calories: 159, proteinG: 3.5, carbsG: 23.6, fatG: 5.6, sugarG: 18.9, servingSize: 100, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Gelato alla vaniglia","de":"Eis (Vanille)","es":"Helado (vainilla)","fr":"Glace (vanille)"}' },
  { name: "Caprese Salad", brand: "Generic", calories: 210, proteinG: 12.0, carbsG: 4.5, fatG: 16.0, fiberG: 0.5, sugarG: 2.8, servingSize: 150, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Insalata Caprese","de":"Caprese-Salat","es":"Ensalada capresa","fr":"Salade caprese"}' },
  { name: "Pesto (Genovese)", brand: "Generic", calories: 79, proteinG: 1.6, carbsG: 1.6, fatG: 7.7, fiberG: 0.3, sugarG: 0.2, servingSize: 30, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Pesto genovese","de":"Pesto","es":"Pesto","fr":"Pesto"}' },
  { name: "Lasagna (beef)", brand: "Generic", calories: 153, proteinG: 9.1, carbsG: 15.2, fatG: 5.8, fiberG: 1.0, sugarG: 3.5, servingSize: 100, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Lasagne (al ragù)","de":"Lasagne","es":"Lasaña","fr":"Lasagne"}' },
  { name: "Tortellini (cheese-filled)", brand: "Generic", calories: 311, proteinG: 12.6, carbsG: 44.0, fatG: 9.6, fiberG: 1.5, sugarG: 1.7, servingSize: 100, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Tortellini (al formaggio)","de":"Tortellini","es":"Tortellini","fr":"Tortellini"}' },
  { name: "Carbonara Sauce", brand: "Generic", calories: 185, proteinG: 7.5, carbsG: 3.0, fatG: 16.0, sugarG: 1.0, servingSize: 100, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Salsa Carbonara","de":"Carbonara-Sauce","es":"Salsa carbonara","fr":"Sauce carbonara"}' },
  { name: "Cannoli (Sicilian)", brand: "Generic", calories: 332, proteinG: 7.2, carbsG: 38.5, fatG: 16.3, sugarG: 18.2, servingSize: 100, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Cannoli siciliani","de":"Cannoli","es":"Cannoli","fr":"Cannoli"}' },

  // ── German Foods ──────────────────────────────────────────────────────────────
  { name: "Bratwurst", brand: "Generic", calories: 333, proteinG: 14.0, carbsG: 2.9, fatG: 29.8, sugarG: 0.5, servingSize: 100, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Bratwurst","de":"Bratwurst","es":"Bratwurst","fr":"Bratwurst"}' },
  { name: "Sauerkraut", brand: "Generic", calories: 19, proteinG: 0.9, carbsG: 4.3, fatG: 0.1, fiberG: 2.9, sugarG: 1.8, servingSize: 100, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Crauti","de":"Sauerkraut","es":"Chucrut","fr":"Choucroute"}' },
  { name: "Pretzels", brand: "Generic", calories: 114, proteinG: 2.9, carbsG: 24, fatG: 0.8, fiberG: 0.9, sugarG: 1, servingSize: 30, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Brezel","de":"Brezel","es":"Pretzel","fr":"Bretzel"}' },
  { name: "Rye Bread", brand: "Generic", calories: 78, proteinG: 2.6, carbsG: 14.5, fatG: 1, fiberG: 1.7, sugarG: 1.2, servingSize: 30, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Pane di segale","de":"Roggenbrot","es":"Pan de centeno","fr":"Pain de seigle"}' },
  { name: "Black Forest Cake", brand: "Generic", calories: 352, proteinG: 4.1, carbsG: 40.2, fatG: 19.7, sugarG: 30.0, servingSize: 100, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Torta della Foresta Nera","de":"Schwarzwälder Kirschtorte","es":"Pastel Selva Negra","fr":"Forêt-Noire"}' },

  // ── Spanish Foods ──────────────────────────────────────────────────────────────
  { name: "Paella (seafood)", brand: "Generic", calories: 171, proteinG: 12.0, carbsG: 22.0, fatG: 4.0, fiberG: 0.8, sugarG: 1.5, servingSize: 100, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Paella di mare","de":"Paella (Meeresfrüchte)","es":"Paella de mariscos","fr":"Paella (fruits de mer)"}' },
  { name: "Tortilla Española", brand: "Generic", calories: 193, proteinG: 9.1, carbsG: 16.6, fatG: 10.5, fiberG: 1.2, sugarG: 1.8, servingSize: 100, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Tortilla spagnola","de":"Spanisches Omelett","es":"Tortilla española","fr":"Tortilla espagnole"}' },
  { name: "Chorizo", brand: "Generic", calories: 228, proteinG: 12.1, carbsG: 1, fatG: 19.4, sugarG: 0.3, servingSize: 50, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Chorizo","de":"Chorizo","es":"Chorizo","fr":"Chorizo"}' },
  { name: "Gazpacho", brand: "Generic", calories: 55, proteinG: 1.5, carbsG: 8.5, fatG: 2.0, fiberG: 1.8, sugarG: 5.5, servingSize: 250, servingUnit: "ml", source: "seed", nameTranslations: '{"it":"Gazpacho","de":"Gazpacho","es":"Gazpacho","fr":"Gazpacho"}' },
  { name: "Jamón Serrano", brand: "Generic", calories: 84, proteinG: 15.3, carbsG: 0, fatG: 2.5, sugarG: 0, servingSize: 50, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Prosciutto spagnolo","de":"Serranoschinken","es":"Jamón serrano","fr":"Jambon serrano"}' },

  // ── French Foods ──────────────────────────────────────────────────────────────
  { name: "Baguette", brand: "Generic", calories: 164, proteinG: 5.6, carbsG: 32.4, fatG: 0.8, fiberG: 1.6, sugarG: 1.8, servingSize: 60, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Baguette","de":"Baguette","es":"Baguette","fr":"Baguette"}' },
  { name: "Quiche Lorraine", brand: "Generic", calories: 295, proteinG: 11.0, carbsG: 16.0, fatG: 21.0, sugarG: 3.5, servingSize: 100, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Quiche Lorraine","de":"Quiche Lorraine","es":"Quiche Lorena","fr":"Quiche Lorraine"}' },
  { name: "Crêpe (plain)", brand: "Generic", calories: 130, proteinG: 3.7, carbsG: 17.4, fatG: 5.1, sugarG: 4.3, servingSize: 60, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Crêpe (liscia)","de":"Crêpe","es":"Crepe","fr":"Crêpe"}' },
  { name: "French Onion Soup", brand: "Generic", calories: 72, proteinG: 3.7, carbsG: 9.8, fatG: 2.4, fiberG: 0.8, sugarG: 3.5, servingSize: 250, servingUnit: "ml", source: "seed", nameTranslations: '{"it":"Zuppa di cipolle","de":"Französische Zwiebelsuppe","es":"Sopa de cebolla francesa","fr":"Soupe à l\'oignon"}' },
  { name: "Ratatouille", brand: "Generic", calories: 65, proteinG: 2.0, carbsG: 10.5, fatG: 2.5, fiberG: 3.2, sugarG: 6.5, servingSize: 150, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Ratatouille","de":"Ratatouille","es":"Ratatouille","fr":"Ratatouille"}' },
  { name: "Crème Brûlée", brand: "Generic", calories: 290, proteinG: 5.0, carbsG: 28.0, fatG: 18.0, sugarG: 24.0, servingSize: 120, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Crème brûlée","de":"Crème brûlée","es":"Crème brûlée","fr":"Crème brûlée"}' },

  // ── Beverages ─────────────────────────────────────────────────────────────────
  { name: "Water", brand: "Generic", calories: 0, proteinG: 0.0, carbsG: 0.0, fatG: 0.0, sugarG: 0.0, servingSize: 250, servingUnit: "ml", source: "seed", nameTranslations: '{"it":"Acqua","de":"Wasser","es":"Agua","fr":"Eau"}' },
  { name: "S.Pellegrino Sparkling Water", brand: "S.Pellegrino", calories: 0, proteinG: 0.0, carbsG: 0.0, fatG: 0.0, sugarG: 0.0, servingSize: 250, servingUnit: "ml", source: "seed", nameTranslations: '{"it":"S.Pellegrino Acqua Frizzante","de":"S.Pellegrino Mineralwasser","es":"S.Pellegrino Agua con gas","fr":"S.Pellegrino Eau pétillante"}' },
  { name: "Coca-Cola", brand: "Coca-Cola", calories: 105, proteinG: 0, carbsG: 26.5, fatG: 0, sugarG: 26.5, servingSize: 250, servingUnit: "ml", source: "seed", nameTranslations: '{"it":"Coca-Cola","de":"Coca-Cola","es":"Coca-Cola","fr":"Coca-Cola"}' },
  { name: "Coca-Cola Zero", brand: "Coca-Cola", calories: 1, proteinG: 0.0, carbsG: 0.1, fatG: 0.0, sugarG: 0.0, servingSize: 250, servingUnit: "ml", source: "seed", nameTranslations: '{"it":"Coca-Cola Zero","de":"Coca-Cola Zero","es":"Coca-Cola Zero","fr":"Coca-Cola Zéro"}' },
  { name: "Red Bull", brand: "Red Bull", calories: 113, proteinG: 0, carbsG: 28.3, fatG: 0, sugarG: 27.5, servingSize: 250, servingUnit: "ml", source: "seed", nameTranslations: '{"it":"Red Bull","de":"Red Bull","es":"Red Bull","fr":"Red Bull"}' },
  { name: "Fanta Orange", brand: "Fanta", calories: 100, proteinG: 0, carbsG: 25, fatG: 0, sugarG: 25, servingSize: 250, servingUnit: "ml", source: "seed", nameTranslations: '{"it":"Fanta Arancia","de":"Fanta Orange","es":"Fanta Naranja","fr":"Fanta Orange"}' },
  { name: "Sprite", brand: "Sprite", calories: 98, proteinG: 0, carbsG: 24.5, fatG: 0, sugarG: 23.8, servingSize: 250, servingUnit: "ml", source: "seed", nameTranslations: '{"it":"Sprite","de":"Sprite","es":"Sprite","fr":"Sprite"}' },
  { name: "Black Coffee", brand: "Generic", calories: 2, proteinG: 0.3, carbsG: 0.0, fatG: 0.0, sugarG: 0.0, servingSize: 240, servingUnit: "ml", source: "seed", nameTranslations: '{"it":"Caffè nero","de":"Schwarzer Kaffee","es":"Café negro","fr":"Café noir"}' },
  { name: "Cappuccino", brand: "Generic", calories: 74, proteinG: 4.0, carbsG: 6.2, fatG: 3.0, sugarG: 5.0, servingSize: 180, servingUnit: "ml", source: "seed", nameTranslations: '{"it":"Cappuccino","de":"Cappuccino","es":"Capuchino","fr":"Cappuccino"}' },
  { name: "Espresso", brand: "Generic", calories: 5, proteinG: 0.3, carbsG: 0.8, fatG: 0.1, sugarG: 0.0, servingSize: 30, servingUnit: "ml", source: "seed", nameTranslations: '{"it":"Espresso","de":"Espresso","es":"Espresso","fr":"Expresso"}' },
  { name: "Latte (whole milk)", brand: "Generic", calories: 120, proteinG: 6.0, carbsG: 9.8, fatG: 5.0, sugarG: 9.0, servingSize: 240, servingUnit: "ml", source: "seed", nameTranslations: '{"it":"Latte (latte intero)","de":"Latte (Vollmilch)","es":"Latte (leche entera)","fr":"Latte (lait entier)"}' },
  { name: "Green Tea", brand: "Generic", calories: 0, proteinG: 0.0, carbsG: 0.0, fatG: 0.0, sugarG: 0.0, servingSize: 240, servingUnit: "ml", source: "seed", nameTranslations: '{"it":"Tè verde","de":"Grüner Tee","es":"Té verde","fr":"Thé vert"}' },
  { name: "Orange Juice (fresh)", brand: "Generic", calories: 112, proteinG: 1.7, carbsG: 25.8, fatG: 0.5, fiberG: 0.5, sugarG: 20.8, servingSize: 240, servingUnit: "ml", source: "seed", nameTranslations: '{"it":"Succo d\'arancia (fresco)","de":"Orangensaft (frisch)","es":"Zumo de naranja (fresco)","fr":"Jus d\'orange (frais)"}' },
  { name: "Whole Milk (glass)", brand: "Generic", calories: 149, proteinG: 7.7, carbsG: 11.7, fatG: 8.0, sugarG: 11.7, servingSize: 244, servingUnit: "ml", source: "seed", nameTranslations: '{"it":"Latte intero (bicchiere)","de":"Vollmilch (Glas)","es":"Leche entera (vaso)","fr":"Lait entier (verre)"}' },
  { name: "Beer (lager)", brand: "Generic", calories: 142, proteinG: 1.7, carbsG: 11.9, fatG: 0, sugarG: 0, servingSize: 330, servingUnit: "ml", source: "seed", nameTranslations: '{"it":"Birra (lager)","de":"Bier (Lager)","es":"Cerveza (lager)","fr":"Bière (lager)"}' },
  { name: "Red Wine", brand: "Generic", calories: 128, proteinG: 0.2, carbsG: 3.9, fatG: 0, sugarG: 0.9, servingSize: 150, servingUnit: "ml", source: "seed", nameTranslations: '{"it":"Vino rosso","de":"Rotwein","es":"Vino tinto","fr":"Vin rouge"}' },
  { name: "White Wine", brand: "Generic", calories: 123, proteinG: 0.2, carbsG: 3.9, fatG: 0, sugarG: 2.1, servingSize: 150, servingUnit: "ml", source: "seed", nameTranslations: '{"it":"Vino bianco","de":"Weißwein","es":"Vino blanco","fr":"Vin blanc"}' },

  // ── Sauces & Condiments ──────────────────────────────────────────────────────
  { name: "Tomato Sauce (marinara)", brand: "Generic", calories: 35, proteinG: 1.5, carbsG: 6.3, fatG: 0.6, fiberG: 1.5, sugarG: 4.0, servingSize: 100, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Salsa di pomodoro","de":"Tomatensauce","es":"Salsa de tomate","fr":"Sauce tomate"}' },
  { name: "Ketchup", brand: "Generic", calories: 30, proteinG: 0.4, carbsG: 7.2, fatG: 0.1, fiberG: 0.1, sugarG: 6.6, servingSize: 30, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Ketchup","de":"Ketchup","es":"Kétchup","fr":"Ketchup"}' },
  { name: "Mayonnaise", brand: "Generic", calories: 102, proteinG: 0.2, carbsG: 0.1, fatG: 11.3, sugarG: 0.1, servingSize: 15, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Maionese","de":"Mayonnaise","es":"Mayonesa","fr":"Mayonnaise"}' },
  { name: "Mustard", brand: "Generic", calories: 10, proteinG: 0.6, carbsG: 1.2, fatG: 0.6, fiberG: 0.5, sugarG: 0.6, servingSize: 15, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Senape","de":"Senf","es":"Mostaza","fr":"Moutarde"}' },
  { name: "Soy Sauce", brand: "Generic", calories: 8, proteinG: 1.2, carbsG: 0.8, fatG: 0, sugarG: 0.3, servingSize: 15, servingUnit: "ml", source: "seed", nameTranslations: '{"it":"Salsa di soia","de":"Sojasoße","es":"Salsa de soja","fr":"Sauce soja"}' },
  { name: "Hummus", brand: "Generic", calories: 89, proteinG: 2.5, carbsG: 10.1, fatG: 4.3, fiberG: 3, sugarG: 0.2, servingSize: 50, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Hummus","de":"Hummus","es":"Hummus","fr":"Houmous"}' },
  { name: "Balsamic Vinegar", brand: "Generic", calories: 13, proteinG: 0.1, carbsG: 2.6, fatG: 0, sugarG: 2.2, servingSize: 15, servingUnit: "ml", source: "seed", nameTranslations: '{"it":"Aceto balsamico","de":"Balsamico-Essig","es":"Vinagre balsámico","fr":"Vinaigre balsamique"}' },

  // ── Grains & Breakfast Cereals ────────────────────────────────────────────────
  { name: "Muesli", brand: "Generic", calories: 227, proteinG: 6.6, carbsG: 37.8, fatG: 4.8, fiberG: 4.4, sugarG: 12, servingSize: 60, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Muesli","de":"Müsli","es":"Muesli","fr":"Muesli"}' },
  { name: "Cornflakes", brand: "Kellogg\'s", calories: 107, proteinG: 2.1, carbsG: 25.2, fatG: 0.1, fiberG: 0.4, sugarG: 2.4, servingSize: 30, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Corn Flakes","de":"Cornflakes","es":"Corn flakes","fr":"Corn flakes"}' },
  { name: "Granola (honey)", brand: "Generic", calories: 259, proteinG: 5, carbsG: 35.2, fatG: 10.9, fiberG: 2.8, sugarG: 11.6, servingSize: 55, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Granola (al miele)","de":"Granola (Honig)","es":"Granola (miel)","fr":"Granola (miel)"}' },

  // ── Fast Food ────────────────────────────────────────────────────────────────
  { name: "Hamburger (classic)", brand: "Generic", calories: 295, proteinG: 17.0, carbsG: 24.0, fatG: 14.0, fiberG: 1.3, sugarG: 5.0, servingSize: 150, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Hamburger (classico)","de":"Hamburger (klassisch)","es":"Hamburguesa (clásica)","fr":"Hamburger (classique)"}' },
  { name: "French Fries", brand: "Generic", calories: 312, proteinG: 3.4, carbsG: 41.4, fatG: 15.0, fiberG: 3.8, sugarG: 0.5, servingSize: 100, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Patatine fritte","de":"Pommes frites","es":"Patatas fritas","fr":"Frites"}' },
  { name: "Hot Dog", brand: "Generic", calories: 290, proteinG: 10.9, carbsG: 24.0, fatG: 16.5, fiberG: 1.0, sugarG: 4.0, servingSize: 120, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Hot dog","de":"Hot Dog","es":"Hot dog","fr":"Hot-dog"}' },
  { name: "Kebab (chicken döner)", brand: "Generic", calories: 230, proteinG: 17.0, carbsG: 26.0, fatG: 7.0, fiberG: 2.0, sugarG: 3.0, servingSize: 150, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Kebab (pollo)","de":"Döner (Hähnchen)","es":"Kebab (pollo)","fr":"Kebab (poulet)"}' },

  // ── Packaged & Snacks ────────────────────────────────────────────────────────
  { name: "Protein Bar (Quest)", brand: "Quest Nutrition", calories: 200, proteinG: 20.0, carbsG: 22.0, fatG: 7.0, fiberG: 14.0, sugarG: 1.0, servingSize: 60, servingUnit: "g", source: "seed" },
  { name: "Rice Cakes (plain)", brand: "Generic", calories: 35, proteinG: 0.7, carbsG: 7.3, fatG: 0.3, fiberG: 0.3, sugarG: 0.0, servingSize: 9, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Gallette di riso","de":"Reiswaffeln","es":"Tortas de arroz","fr":"Galettes de riz"}' },
  { name: "Dark Chocolate (70%)", brand: "Generic", calories: 167, proteinG: 2.2, carbsG: 12.9, fatG: 11.9, fiberG: 3.1, sugarG: 6.8, servingSize: 28, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Cioccolato fondente (70%)","de":"Dunkle Schokolade (70%)","es":"Chocolate negro (70%)","fr":"Chocolat noir (70%)"}' },
  { name: "Granola Bar", brand: "Generic", calories: 193, proteinG: 3.9, carbsG: 29.0, fatG: 7.6, fiberG: 1.5, sugarG: 12.0, servingSize: 47, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Barretta ai cereali","de":"Müsliriegel","es":"Barrita de cereales","fr":"Barre de céréales"}' },
  { name: "Chips (potato)", brand: "Generic", calories: 150, proteinG: 2, carbsG: 14.8, fatG: 9.7, fiberG: 1.3, sugarG: 0.1, servingSize: 28, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Patatine (in busta)","de":"Chips","es":"Patatas chips","fr":"Chips"}' },
  { name: "Popcorn (plain)", brand: "Generic", calories: 108, proteinG: 3.6, carbsG: 21.8, fatG: 1.3, fiberG: 4.1, sugarG: 0.3, servingSize: 28, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Popcorn (naturale)","de":"Popcorn","es":"Palomitas","fr":"Pop-corn"}' },
  { name: "Nutella", brand: "Ferrero", calories: 108, proteinG: 1.3, carbsG: 11.5, fatG: 6.2, fiberG: 0.7, sugarG: 11.3, servingSize: 20, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Nutella","de":"Nutella","es":"Nutella","fr":"Nutella"}' },

  // ── Soups & Prepared Meals ──────────────────────────────────────────────────
  { name: "Minestrone Soup", brand: "Generic", calories: 65, proteinG: 3.2, carbsG: 11.0, fatG: 1.0, fiberG: 2.5, sugarG: 3.5, servingSize: 250, servingUnit: "ml", source: "seed", nameTranslations: '{"it":"Minestrone","de":"Minestrone","es":"Minestrone","fr":"Minestrone"}' },
  { name: "Chicken Soup", brand: "Generic", calories: 75, proteinG: 7.0, carbsG: 8.5, fatG: 1.5, fiberG: 0.8, sugarG: 2.0, servingSize: 250, servingUnit: "ml", source: "seed", nameTranslations: '{"it":"Brodo di pollo","de":"Hühnersuppe","es":"Sopa de pollo","fr":"Soupe de poulet"}' },

  // ── Desserts ─────────────────────────────────────────────────────────────────
  { name: "Cheesecake (slice)", brand: "Generic", calories: 385, proteinG: 6.6, carbsG: 34.8, fatG: 24.8, sugarG: 27.6, servingSize: 120, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Cheesecake (fetta)","de":"Käsekuchen","es":"Tarta de queso","fr":"Cheesecake"}' },
  { name: "Chocolate Cake", brand: "Generic", calories: 352, proteinG: 4.8, carbsG: 50.7, fatG: 15.0, fiberG: 2.3, sugarG: 35.0, servingSize: 100, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Torta al cioccolato","de":"Schokoladenkuchen","es":"Pastel de chocolate","fr":"Gâteau au chocolat"}' },
  { name: "Waffles (plain)", brand: "Generic", calories: 218, proteinG: 5.9, carbsG: 27.2, fatG: 9.8, fiberG: 1, sugarG: 7.3, servingSize: 75, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Waffle (semplici)","de":"Waffeln","es":"Gofres","fr":"Gaufres"}' },
  { name: "Pancakes (plain)", brand: "Generic", calories: 175, proteinG: 4.5, carbsG: 21.8, fatG: 7.9, fiberG: 0.6, sugarG: 6.2, servingSize: 77, servingUnit: "g", source: "seed", nameTranslations: '{"it":"Pancake","de":"Pfannkuchen","es":"Tortitas","fr":"Pancakes"}' },
  { name: "Apple Pie (slice)", brand: "Generic", calories: 296, proteinG: 2.9, carbsG: 42.5, fatG: 13.8, fiberG: 1.9, sugarG: 18.1, servingSize: 125, servingUnit: "g", source: "seed" },
];

async function main() {
  console.log("Seeding database...");

  let seeded = 0;
  let skipped = 0;

  for (const food of foods) {
    const key = `seed-${food.name.toLowerCase().replace(/[\s()'']/g, "-").replace(/-+/g, "-")}`;
    try {
      await prisma.food.upsert({
        where: { barcode: key },
        update: {
          calories: food.calories,
          proteinG: food.proteinG,
          carbsG: food.carbsG,
          fatG: food.fatG,
          fiberG: food.fiberG ?? null,
          sugarG: food.sugarG ?? null,
          nameTranslations: (food as { nameTranslations?: string }).nameTranslations ?? null,
        },
        create: {
          ...food,
          fiberG: food.fiberG ?? null,
          sugarG: food.sugarG ?? null,
          nameTranslations: (food as { nameTranslations?: string }).nameTranslations ?? null,
          barcode: key,
          isPublic: true,
        },
      });
      seeded++;
    } catch (e) {
      console.warn(`Skipped "${food.name}":`, (e as Error).message);
      skipped++;
    }
  }

  console.log(`Seeded ${seeded} foods (${skipped} skipped).`);
  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
