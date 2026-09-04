export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: any;
};

export type MenuCategory = {
  id: string;
  name: string;
  items: MenuItem[];
};

const menuImage = require("../../assets/images/akrobite-logo.png");

export const brachersInnMenu: MenuCategory[] = [
  // =====================================================
  // MAIN DISHES
  // =====================================================
  {
    id: "brachers-main-dishes",
    name: "Main Dishes",
    items: [
      {
        id: "brachers-fried-rice-jollof-small",
        name: "Fried Rice and Jollof",
        description: "Small",
        price: 30,
        category: "Main Dishes",
        image: menuImage,
      },
      {
        id: "brachers-fried-rice-jollof-medium",
        name: "Fried Rice and Jollof",
        description: "Medium",
        price: 40,
        category: "Main Dishes",
        image: menuImage,
      },
      {
        id: "brachers-fried-rice-jollof-large",
        name: "Fried Rice and Jollof",
        description: "Large",
        price: 50,
        category: "Main Dishes",
        image: menuImage,
      },

      {
        id: "brachers-assorted-fried-rice-jollof",
        name: "Assorted Fried Rice or Jollof",
        description: "Assorted",
        price: 70,
        category: "Main Dishes",
        image: menuImage,
      },

      {
        id: "brachers-chicken-shawarma",
        name: "Chicken Shawarma",
        description: "Chicken shawarma",
        price: 60,
        category: "Main Dishes",
        image: menuImage,
      },

      {
        id: "brachers-potato-chips-chicken",
        name: "Potato Chips and Chicken",
        description: "Potato chips served with chicken",
        price: 60,
        category: "Main Dishes",
        image: menuImage,
      },

      {
        id: "brachers-fried-rice-jollof-red-fish",
        name: "Fried Rice or Jollof and Fried Red Fish",
        description: "Served with fried red fish",
        price: 70,
        category: "Main Dishes",
        image: menuImage,
      },

      {
        id: "brachers-potato-chips-only",
        name: "Potato Chips Only",
        description: "Potato chips",
        price: 40,
        category: "Main Dishes",
        image: menuImage,
      },

      {
        id: "brachers-assorted-jumbo-pack",
        name: "Assorted Fried Rice or Jollof",
        description:
          "Jumbo pack with eggs, chicken, sausage, gizzard, carrot, green pepper, onions and cabbage",
        price: 100,
        category: "Main Dishes",
        image: menuImage,
      },

      {
        id: "brachers-small-pack",
        name: "Small Pack",
        description:
          "Sausage, chicken, eggs, cabbage, carrot, onions and green pepper",
        price: 70,
        category: "Main Dishes",
        image: menuImage,
      },

      {
        id: "brachers-chicken-stir-fry",
        name: "Chicken Stir Fry",
        description: "Chicken and vegetables mixed in sweet spicy sauce",
        price: 70,
        category: "Main Dishes",
        image: menuImage,
      },

      {
        id: "brachers-chicken-pack",
        name: "Chicken Pack",
        description: "Six pieces of chicken",
        price: 50,
        category: "Main Dishes",
        image: menuImage,
      },

      {
        id: "brachers-vegetable-fried-rice",
        name: "Vegetable Fried Rice",
        description: "Cabbage, carrots, green peppers and onions",
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
    id: "brachers-pizza",
    name: "Pizza",
    items: [
      // BEEF
      {
        id: "brachers-beef-pizza-small",
        name: "Beef Pizza",
        description: "Small • Includes chicken, beef and sausage",
        price: 120,
        category: "Pizza",
        image: menuImage,
      },
      {
        id: "brachers-beef-pizza-medium",
        name: "Beef Pizza",
        description: "Medium • Includes chicken, beef and sausage",
        price: 150,
        category: "Pizza",
        image: menuImage,
      },
      {
        id: "brachers-beef-pizza-large",
        name: "Beef Pizza",
        description: "Large • Includes chicken, beef and sausage",
        price: 170,
        category: "Pizza",
        image: menuImage,
      },
      {
        id: "brachers-beef-pizza-family",
        name: "Beef Pizza",
        description: "Family • Includes chicken, beef and sausage",
        price: 200,
        category: "Pizza",
        image: menuImage,
      },

      // CHICKEN
      {
        id: "brachers-chicken-pizza-small",
        name: "Chicken Pizza",
        description: "Small • Includes chicken, beef and sausage",
        price: 120,
        category: "Pizza",
        image: menuImage,
      },
      {
        id: "brachers-chicken-pizza-medium",
        name: "Chicken Pizza",
        description: "Medium • Includes chicken, beef and sausage",
        price: 150,
        category: "Pizza",
        image: menuImage,
      },
      {
        id: "brachers-chicken-pizza-large",
        name: "Chicken Pizza",
        description: "Large • Includes chicken, beef and sausage",
        price: 170,
        category: "Pizza",
        image: menuImage,
      },
      {
        id: "brachers-chicken-pizza-family",
        name: "Chicken Pizza",
        description: "Family • Includes chicken, beef and sausage",
        price: 200,
        category: "Pizza",
        image: menuImage,
      },

      // SAUSAGE
      {
        id: "brachers-sausage-pizza-small",
        name: "Sausage Pizza",
        description: "Small • Includes chicken, beef and sausage",
        price: 120,
        category: "Pizza",
        image: menuImage,
      },
      {
        id: "brachers-sausage-pizza-medium",
        name: "Sausage Pizza",
        description: "Medium • Includes chicken, beef and sausage",
        price: 150,
        category: "Pizza",
        image: menuImage,
      },
      {
        id: "brachers-sausage-pizza-large",
        name: "Sausage Pizza",
        description: "Large • Includes chicken, beef and sausage",
        price: 170,
        category: "Pizza",
        image: menuImage,
      },
      {
        id: "brachers-sausage-pizza-family",
        name: "Sausage Pizza",
        description: "Family • Includes chicken, beef and sausage",
        price: 200,
        category: "Pizza",
        image: menuImage,
      },

      // ALL SEASON
      {
        id: "brachers-all-season-medium",
        name: "All Season Pizza",
        description: "Medium • Includes chicken, beef and sausage",
        price: 150,
        category: "Pizza",
        image: menuImage,
      },
      {
        id: "brachers-all-season-large",
        name: "All Season Pizza",
        description: "Large • Includes chicken, beef and sausage",
        price: 170,
        category: "Pizza",
        image: menuImage,
      },
      {
        id: "brachers-all-season-family",
        name: "All Season Pizza",
        description: "Family • Includes chicken, beef and sausage",
        price: 200,
        category: "Pizza",
        image: menuImage,
      },
    ],
  },
];
