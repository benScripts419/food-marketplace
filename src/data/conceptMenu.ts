export type MenuItem = {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  subCategory?: string;
  image: any;
};

export type MenuCategory = {
  id: string;
  name: string;
  items: MenuItem[];
};

const kwMixedSalad = require("../../assets/images/food/mixed-salad.jpg");
const friedRiceOnly = require("../../assets/images/food/friedrice-only.jpg");
const americanBreakfast = require("../../assets/images/food/american-breakfast.jpg");
const englishBreakfast = require("../../assets/images/food/english-breakfast.jpg");
const samosa = require("../../assets/images/food/samosa.jpeg");
const springRolls = require("../../assets/images/food/spring-rolls.jpeg");
const pancake = require("../../assets/images/food/pancake.jpg");
const meatPie = require("../../assets/images/food/meat-pie.jpg");
const porkRibs = require("../../assets/images/food/pork-ribs.jpg");
const steak = require("../../assets/images/food/steak.jpg");
const lambRibs = require("../../assets/images/food/lamb-ribs.jpeg");
const turkey = require("../../assets/images/food/turkey.jpeg");
const chickenThigh = require("../../assets/images/food/chicken-thigh.png");
const potatoSalad = require("../../assets/images/food/potato-salad.jpeg");
const chickenSalad = require("../../assets/images/food/concept-chicken-salad.jpeg");
const greekSalad = require("../../assets/images/food/greek-salad.jpg");
const sandwichWithFries = require("../../assets/images/food/sandwich-fries.jpg");
const burgerWithFries = require("../../assets/images/food/burger-with-fries.jpg");
const sandwich = require("../../assets/images/food/sandwich.jpg");
const chickenWings = require("../../assets/images/food/chicken-wings.jpeg");
const tunaSalad = require("../../assets/images/food/tuna-salad.jpg");
const steamVegies = require("../../assets/images/food/steam-vegies.jpg");
const chefSpecial = require("../../assets/images/food/chef-special.jpg");
const chickenSandwich = require("../../assets/images/food/chicken-sandwich.jpg");
const clubSandwich = require("../../assets/images/food/club-sandwich.jpg");
const porkPieces = require("../../assets/images/food/pork-pieces.jpg");


export const conceptMenu: MenuCategory[] = [
  // ==============================================
  //  BREAKFAST
  //   ============================================
  {
    id: "breakfast",
    name: "Breakfast",
    items: [
      {
        id: "concept-1",
        name: "English",
        description:
          "Bake beans, toasted tomatoes, mushrooms, baking/ham, sliced bread or mini buns with, coffee / tea / hot chocolate.",
        price: 120,
        category: "Breakfast",
        image: englishBreakfast,
      },
      {
        id: "concept-2",
        name: "American",
        description:
          "Waffle / pancakes, baking, sausages, ash brown, eggs, syrup, toasted bread, with coffee / tea / hot chocolate.",
        price: 100,
        category: "Breakfast",
        image: americanBreakfast,
      },
    ],
  },

  // =========================
  // STARTERS
  // =========================

  {
    id: "salads",
    name: "Salads",
    items: [
      {
        id: "concept-salads-1",
        name: "Tuna Salad",
        price: 70,
        category: "Starter",
        image: tunaSalad,
      },
      {
        id: "concept-salads-2",
        name: "Chicken Salad",
        price: 80,
        category: "Starter",
        image: chickenSalad,
      },
      {
        id: "concept-salads-3",
        name: "Greek Salad",
        price: 85,
        category: "Starter",
        image: greekSalad,
      },
      {
        id: "concept-salads-4",
        name: "Steam Vegies",
        price: 60,
        category: "Starter",
        image: steamVegies,
      },
      {
        id: "concept-salads-5",
        name: "Potato Salad",
        price: 85,
        category: "Starter",
        image: potatoSalad,
      },
      {
        id: "concept-salads-6",
        name: "Chef Special",
        price: 100,
        category: "Starter",
        image: chefSpecial,
      },
    ],
  },

  // =======================
  // DESSERTS
  // =======================

  {
    id: "wrap-and-stacks",
    name: "Wrap & Stacks",
    items: [
      {
        id: "concept-wrap-and-stack-1",
        name: "Burgers with Fries",
        price: 60,
        category: "Desserts",
        image: burgerWithFries,
      },
      {
        id: "concept-wrap-and-stack-2",
        name: "Sandwich",
        description: "Club",
        price: 70,
        category: "Desserts",
        subCategory: "Club",
        image: clubSandwich,
      },
      {
        id: "concept-wrap-and-stack-3",
        name: "Sandwich",
        description: "Chicken",
        price: 60,
        category: "Desserts",
        subCategory: "Chicken",
        image: chickenSandwich,
      },
      {
        id: "concept-wrap-and-stack-4",
        name: "Shawarma",
        description: "Beef",
        price: 90,
        category: "Desserts",
        subCategory: "Beef",
        image: kwMixedSalad,
      },
      {
        id: "concept-wrap-and-stack-5",
        name: "Sandwich",
        description: "Chicken",
        price: 60,
        category: "Desserts",
        subCategory: "Chicken",
        image: chickenSandwich,
      },
    ],
  },

  // ===================
  // PIZZAS
  // ===================

  // ===================
  // SNACK
  // ===================

  {
    id: "snacks",
    name: "Snacks",
    items: [
      {
        id: "concept-snack-1",
        name: "Spring Rolls",
        description: "Per 5 pieces",
        price: 50,
        category: "Snacks",
        image: springRolls,
      },
      {
        id: "concept-snack-2",
        name: "Pancake",
        description: "Per 15 pieces",
        price: 30,
        category: "Snacks",
        image: pancake,
      },
      {
        id: "concept-snack-3",
        name: "Samosa",
        description: "Per 5 pieces",
        price: 50,
        category: "Snacks",
        image: samosa,
      },
      {
        id: "concept-snack-4",
        name: "Meat Pie",
        description: "Per piece",
        price: 15,
        category: "Snacks",
        image: meatPie,
      },
    ],
  },

  // ===================
  // EXTRA TOPPINGS
  // ===================

  {
    id: "extra-toppings",
    name: "Extra Toppings",
    items: [
      {
        id: "concept-extra-toppings-1",
        name: "Spring Rolls",
        price: 30,
        category: "Extra Toppings",
        image: kwMixedSalad,
      },
      {
        id: "concept-extra-toppings-2",
        name: "Pancake",
        price: 30,
        category: "Extra Toppings",
        image: kwMixedSalad,
      },
      {
        id: "concept-extra-toppings-3",
        name: "Samosa",
        price: 30,
        category: "Extra Toppings",
        image: kwMixedSalad,
      },
      {
        id: "concept-extra-toppings-4",
        name: "Meat Pie",
        price: 30,
        category: "Extra Toppings",
        image: kwMixedSalad,
      },
    ],
  },

  // ===================
  // MAIN DISHES
  // ===================

  {
    id: "main",
    name: "Main",
    items: [
      {
        id: "concept-main-1",
        name: "Chicken Thigh",
        price: 80,
        category: "Main",
        image: chickenThigh,
      },
      {
        id: "concept-main-2",
        name: "Pork",
        price: 90,
        category: "Main",
        image: porkPieces,
      },
      {
        id: "concept-main-3",
        name: "Lamb Ribs",
        price: 250,
        category: "Main",
        image: lambRibs,
      },
      {
        id: "concept-main-4",
        name: "Wings",
        price: 70,
        category: "Main",
        image: chickenWings,
      },
      {
        id: "concept-main-5",
        name: "Turkey",
        price: 80,
        category: "Main",
        image: turkey,
      },
      {
        id: "concept-main-6",
        name: "Steak",
        price: 220,
        category: "Main",
        image: steak,
      },
      {
        id: "concept-main-7",
        name: "Pork Ribs",
        price: 120,
        category: "Main",
        image: porkRibs,
      },
    ],
  },

  // ===================
  // SIDES
  // ===================

  {
    id: "sides",
    name: "Sides",
    items: [
      {
        id: "concept-sides-1",
        name: "Fried Rice",
        description: "Only",
        price: 50,
        category: "Sides",
        image: friedRiceOnly,
      },
      {
        id: "concept-sides-2",
        name: "Jollof",
        description: "Only",
        price: 50,
        category: "Sides",
        image: kwMixedSalad,
      },
      {
        id: "concept-sides-3",
        name: "Creamed Potatoes",
        description: "Only",
        price: 50,
        category: "Sides",
        image: kwMixedSalad,
      },
      {
        id: "concept-sides-4",
        name: "Banku",
        description: "3 Pieces",
        price: 30,
        category: "Sides",
        image: kwMixedSalad,
      },
      {
        id: "concept-sides-5",
        name: "Yam",
        description: "Only",
        price: 40,
        category: "Sides",
        image: kwMixedSalad,
      },
    ],
  },

  // ===================
  // ASSORTED
  // ===================

  {
    id: "assorted",
    name: "Assorted",
    items: [
      {
        id: "concept-assorted-1",
        name: "Jollof",
        description: "Chicken",
        price: 80,
        category: "Assorted",
        subCategory: "Chicken",
        image: kwMixedSalad,
      },
      {
        id: "concept-assorted-2",
        name: "Jollof",
        description: "Beef",
        price: 80,
        category: "Assorted",
        subCategory: "Beef",
        image: kwMixedSalad,
      },
      {
        id: "concept-assorted-3",
        name: "Jollof",
        description: "Pork",
        price: 90,
        category: "Assorted",
        subCategory: "Chicken",
        image: kwMixedSalad,
      },
      {
        id: "concept-assorted-4",
        name: "Fried Rice",
        description: "Chicken",
        price: 80,
        category: "Assorted",
        subCategory: "Chicken",
        image: kwMixedSalad,
      },
      {
        id: "concept-assorted-5",
        name: "Fried Rice",
        description: "Beef",
        price: 80,
        category: "Assorted",
        subCategory: "Beef",
        image: kwMixedSalad,
      },
      {
        id: "concept-assorted-6",
        name: "Fried Rice",
        description: "Pork",
        price: 90,
        category: "Assorted",
        subCategory: "Pork",
        image: kwMixedSalad,
      },
    ],
  },

  // ===================
  // SPECIALS
  // ===================

  {
    id: "specials",
    name: "Specials",
    items: [
      {
        id: "concept-special-1",
        name: "Noodles",
        description: "Pork",
        price: 80,
        category: "Specials",
        subCategory: "Pork",
        image: kwMixedSalad,
      },
      {
        id: "concept-special-2",
        name: "Noodles",
        description: "Beef",
        price: 80,
        category: "Specials",
        subCategory: "Beef",
        image: kwMixedSalad,
      },

      {
        id: "concept-special-3",
        name: "Loaded Fries",
        price: 100,
        category: "Specials",
        image: kwMixedSalad,
      },

      {
        id: "concept-special-4",
        name: "Muncho Plantano",
        description: "Spicy",
        price: 100,
        category: "Specials",
        subCategory: "Spicy",
        image: kwMixedSalad,
      },
      {
        id: "concept-special-5",
        name: "Muncho Plantano",
        description: "Non-spicy",
        price: 100,
        category: "Specials",
        subCategory: "Pork",
        image: kwMixedSalad,
      },
    ],
  },

  // ===================
  // LOCALS
  // ===================

  {
    id: "locals",
    name: "Locals",
    items: [
      {
        id: "concept-locals-1",
        name: "Banku with Tilapia",
        description: "Grilled",
        price: 150,
        category: "Locals",
        subCategory: "Medium",
        image: kwMixedSalad,
      },
      {
        id: "concept-locals-2",
        name: "Banku with Tilapia",
        description: "Fried",
        price: 150,
        category: "Locals",
        subCategory: "Large",
        image: kwMixedSalad,
      },

      {
        id: "concept-locals-3",
        name: "Banku with Assorted Okro",
        description: "Oil",
        price: 100,
        category: "Locals",
        subCategory: "Oil",
        image: kwMixedSalad,
      },
      {
        id: "concept-locals-4",
        name: "Banku with Assorted Okro",
        description: "Oiless",
        price: 100,
        category: "Locals",
        subCategory: "Oiless",
        image: kwMixedSalad,
      },

      {
        id: "concept-locals-5",
        name: "Acheke with Tilapia",
        price: 150,
        category: "Locals",
        image: kwMixedSalad,
      },

      {
        id: "concept-locals-6",
        name: "Eba with Agushie",
        price: 100,
        category: "Locals",
        image: kwMixedSalad,
      },
    ],
  },

  // ===================
  // SEA FOODS
  // ===================

  {
    id: "sea-foods",
    name: "Sea Foods",
    items: [
      {
        id: "concept-sea-foods-1",
        name: "Shrimps",
        price: 180,
        category: "Sea Foods",
        image: kwMixedSalad,
      },
      {
        id: "concept-sea-foods-2",
        name: "Lobsters",
        price: 180,
        category: "Sea Foods",
        image: kwMixedSalad,
      },
      {
        id: "concept-sea-foods-3",
        name: "Prawns",
        price: 180,
        category: "Sea Foods",
        image: kwMixedSalad,
      },
      {
        id: "concept-sea-foods-4",
        name: "Snapper",
        price: 120,
        category: "Sea Foods",
        image: kwMixedSalad,
      },
      {
        id: "concept-sea-foods-5",
        name: "Tilapia",
        price: 15,
        category: "Sea Foods",
        image: kwMixedSalad,
      },
    ],
  },
];
