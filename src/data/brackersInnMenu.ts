export type MenuItem = {
  id: string;
  name: string;
  description: string;
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

const menuImage = require("../../assets/images/akrobite-logo.png");
const eggFriedRice = require("../../assets/images/food/fried-rice.jpg");
const jollofRice = require("../../assets/images/food/jollof-rice.jpg");
const assortedFriedRice = require("../../assets/images/food/assorted-fried-rice.jpg");
const assortedJollofRice = require("../../assets/images/food/assorted-jollof-rice.jpg");

export const brackersInnMenu: MenuCategory[] = [
  // =====================================================
  // MAIN DISHES
  // =====================================================
  {
    id: "brackers-main-dishes",
    name: "Main Dishes",
    items: [
      {
        id: "brackers-fried-rice-small",
        name: "Fried Rice",
        description: "Small",
        price: 30,
        category: "Main Dishes",
        subCategory: "Small",
        image: eggFriedRice,
      },
      {
        id: "brackers-jollof-small",
        name: "Jollof",
        description: "Small",
        price: 30,
        category: "Main Dishes",
        subCategory: "Small",
        image: jollofRice,
      },
      {
        id: "brackers-fried-rice-medium",
        name: "Fried Rice",
        description: "Medium",
        price: 40,
        category: "Main Dishes",
        subCategory: "Medium",
        image: eggFriedRice,
      },
      {
        id: "brackers-jollof-medium",
        name: "Jollof",
        description: "Medium",
        price: 40,
        category: "Main Dishes",
        subCategory: "Medium",
        image: jollofRice,
      },
      {
        id: "brackers-vegetable-fried-rice",
        name: "Vegetable Fried Rice",
        description: "Cabbage, carrots, green peppers and onions",
        price: 50,
        category: "Main Dishes",
        subCategory: "Large",
        image: menuImage,
      },
      {
        id: "brackers-fried-rice-large",
        name: "Fried Rice",
        description: "Large",
        price: 50,
        category: "Main Dishes",
        subCategory: "Large",
        image: eggFriedRice,
      },
      {
        id: "brackers-jollof-large",
        name: "Jollof",
        description: "Large",
        price: 50,
        category: "Main Dishes",
        subCategory: "Large",
        image: jollofRice,
      },

      {
        id: "brackers-assorted-fried-rice",
        name: "Assorted Fried Rice",
        description: "Assorted",
        price: 70,
        category: "Main Dishes",
        subCategory: "Assorted",
        image: assortedFriedRice,
      },
      {
        id: "brackers-assorted-jollof",
        name: "Assorted Jollof",
        description: "Assorted",
        price: 70,
        category: "Main Dishes",
        subCategory: "Assorted",
        image: assortedJollofRice,
      },
      {
        id: "brackers-fried-rice-red-fish",
        name: "Fried Rice and Fried Red Fish",
        description: "Served with fried red fish",
        price: 70,
        category: "Main Dishes",
        subCategory: "Small Pack",
        image: assortedFriedRice,
      },
      {
        id: "brackers-jollof-red-fish",
        name: "Jollof and Fried Red Fish",
        description: "Served with fried red fish",
        price: 70,
        category: "Main Dishes",
        subCategory: "Small Pack",
        image: assortedJollofRice,
      },
      {
        id: "brackers-assorted-fried-rice-jumbo",
        name: "Assorted Fried Rice",
        description:
          "Jumbo pack with eggs, chicken, sausage, gizzard, carrot, green pepper, onions and cabbage",
        price: 100,
        category: "Main Dishes",
        subCategory: "Jumbo Pack",
        image: assortedFriedRice,
      },
      {
        id: "brackers-assorted-jollof-jumbo",
        name: "Assorted Jollof",
        description:
          "Jumbo pack with eggs, chicken, sausage, gizzard, carrot, green pepper, onions and cabbage",
        price: 100,
        category: "Main Dishes",
        subCategory: "Jumbo Pack",
        image: assortedJollofRice,
      },

      {
        id: "brackers-chicken-shawarma",
        name: "Chicken Shawarma",
        description: "Chicken shawarma",
        price: 60,
        category: "Main Dishes",
        image: menuImage,
      },

      {
        id: "brackers-potato-chips-chicken",
        name: "Potato Chips and Chicken",
        description: "Potato chips served with chicken",
        price: 60,
        category: "Main Dishes",
        image: menuImage,
      },

      {
        id: "brackers-potato-chips-only",
        name: "Potato Chips Only",
        description: "Potato chips",
        price: 40,
        category: "Main Dishes",
        image: menuImage,
      },

      {
        id: "brackers-small-pack",
        name: "Small Pack",
        description:
          "Sausage, chicken, eggs, cabbage, carrot, onions and green pepper",
        price: 70,
        category: "Main Dishes",
        image: menuImage,
      },

      {
        id: "brackers-chicken-stir-fry",
        name: "Chicken Stir Fry",
        description: "Chicken and vegetables mixed in sweet spicy sauce",
        price: 70,
        category: "Main Dishes",
        image: menuImage,
      },

      {
        id: "brackers-chicken-pack",
        name: "Chicken Pack",
        description: "Six pieces of chicken",
        price: 50,
        category: "Main Dishes",
        image: menuImage,
      },
    ],
  },

  // =====================================================
  // PIZZA
  // =====================================================
  {
    id: "brackers-pizza",
    name: "Pizza",
    items: [
      // BEEF
      {
        id: "brackers-beef-pizza-small",
        name: "Beef Pizza",
        description: "Small • Includes chicken, beef and sausage",
        price: 120,
        category: "Pizza",
        subCategory: "Small",
        image: menuImage,
      },
      {
        id: "brackers-beef-pizza-medium",
        name: "Beef Pizza",
        description: "Medium • Includes chicken, beef and sausage",
        price: 150,
        category: "Pizza",
        subCategory: "Medium",
        image: menuImage,
      },
      {
        id: "brackers-beef-pizza-large",
        name: "Beef Pizza",
        description: "Large • Includes chicken, beef and sausage",
        price: 170,
        category: "Pizza",
        subCategory: "Large",
        image: menuImage,
      },
      {
        id: "brackers-beef-pizza-family",
        name: "Beef Pizza",
        description: "Family • Includes chicken, beef and sausage",
        price: 200,
        category: "Pizza",
        subCategory: "Family Size",
        image: menuImage,
      },

      // CHICKEN
      {
        id: "brackers-chicken-pizza-small",
        name: "Chicken Pizza",
        description: "Small • Includes chicken, beef and sausage",
        price: 120,
        category: "Pizza",
        subCategory: "Small",
        image: menuImage,
      },
      {
        id: "brackers-chicken-pizza-medium",
        name: "Chicken Pizza",
        description: "Medium • Includes chicken, beef and sausage",
        price: 150,
        category: "Pizza",
        subCategory: "Medium",
        image: menuImage,
      },
      {
        id: "brackers-chicken-pizza-large",
        name: "Chicken Pizza",
        description: "Large • Includes chicken, beef and sausage",
        price: 170,
        category: "Pizza",
        subCategory: "Large",
        image: menuImage,
      },
      {
        id: "brackers-chicken-pizza-family",
        name: "Chicken Pizza",
        description: "Family • Includes chicken, beef and sausage",
        price: 200,
        category: "Pizza",
        subCategory: "Family Size",
        image: menuImage,
      },

      // SAUSAGE
      {
        id: "brackers-sausage-pizza-small",
        name: "Sausage Pizza",
        description: "Small • Includes chicken, beef and sausage",
        price: 120,
        category: "Pizza",
        subCategory: "Small",
        image: menuImage,
      },
      {
        id: "brackers-sausage-pizza-medium",
        name: "Sausage Pizza",
        description: "Medium • Includes chicken, beef and sausage",
        price: 150,
        category: "Pizza",
        subCategory: "Medium",
        image: menuImage,
      },
      {
        id: "brackers-sausage-pizza-large",
        name: "Sausage Pizza",
        description: "Large • Includes chicken, beef and sausage",
        price: 170,
        category: "Pizza",
        subCategory: "Large",
        image: menuImage,
      },
      {
        id: "brackers-sausage-pizza-family",
        name: "Sausage Pizza",
        description: "Family • Includes chicken, beef and sausage",
        price: 200,
        category: "Pizza",
        subCategory: "Family Size",
        image: menuImage,
      },

      // ALL SEASON
      {
        id: "brackers-all-season-medium",
        name: "All Season Pizza",
        description: "Medium • Includes chicken, beef and sausage",
        price: 150,
        category: "Pizza",
        subCategory: "Medium",
        image: menuImage,
      },
      {
        id: "brackers-all-season-large",
        name: "All Season Pizza",
        description: "Large • Includes chicken, beef and sausage",
        price: 170,
        category: "Pizza",
        subCategory: "Large",
        image: menuImage,
      },
      {
        id: "brackers-all-season-family",
        name: "All Season Pizza",
        description: "Family • Includes chicken, beef and sausage",
        price: 200,
        category: "Pizza",
        subCategory: "Family Size",
        image: menuImage,
      },
    ],
  },
];
