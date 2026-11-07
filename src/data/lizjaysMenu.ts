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
const strawberryTea = require("../../assets/images/food/strawberry-tea.png");
const vanillaTea = require("../../assets/images/food/vanilla-tea.png");
const coconutTea = require("../../assets/images/food/coconut-milk-tea.png");
const blueberryTea = require("../../assets/images/food/blueberry-tea.png");
const chocolateTea = require("../../assets/images/food/chocolate-milk-tea.png");
const taroTea = require("../../assets/images/food/taro-tea.png");
const purpleBlueberryTea = require("../../assets/images/food/purple-blueberry-tea.png");
const originalTea = require("../../assets/images/food/original-milk-tea.png");

const sandwich = require("../../assets/images/food/sandwich.jpg");
const burger = require("../../assets/images/food/burger.jpg");
const samosa = require("../../assets/images/food/samosa.jpg");
const springRolls = require("../../assets/images/food/spring-rolls.jpeg");
const sandwichWithFries = require("../../assets/images/food/sandwich-fries.jpg");
const allSeason = require("../../assets/images/food/all-season.png");
const chickenPizza = require("../../assets/images/food/chicken-pizza.png");
const beefPizza = require("../../assets/images/food/beef-pizza.png");
const sausagePizza = require("../../assets/images/food/sausage-pizza.png");
const margheritaPizza = require("../../assets/images/food/margherita-pizza.png");
const pepperoniPizza = require("../../assets/images/food/pepperoni-pizza.png");

export const lizjaysMenu: MenuCategory[] = [
  // =====================================================
  // TEA / BOBA
  // =====================================================
  {
    id: "Milk Series",
    name: "Tea",
    items: [
      {
        id: "lizjay-chocolate-milk-tea-500",
        name: "Chocolate",
        description: "500ml",
        price: 40,
        category: "Boba Tea",
        subCategory: "500ml",
        image: chocolateTea,
      },
      {
        id: "lizjay-chocolate-milk-tea-700",
        name: "Chocolate",
        description: "700ml",
        price: 50,
        category: "Boba Tea",
        subCategory: "700ml",
        image: chocolateTea,
      },

      {
        id: "lizjay-blueberry-milk-tea-500",
        name: "Blueberry",
        description: "500ml",
        price: 40,
        category: "Boba Tea",
        subCategory: "500ml",
        image: blueberryTea,
      },
      {
        id: "lizjay-blueberry-milk-tea-700",
        name: "Blueberry",
        description: "700ml",
        price: 50,
        category: "Boba Tea",
        subCategory: "700ml",
        image: blueberryTea,
      },

      {
        id: "lizjay-coconut-milk-tea-500",
        name: "Coconut",
        description: "500ml",
        price: 40,
        category: "Boba Tea",
        subCategory: "500ml",
        image: coconutTea,
      },
      {
        id: "lizjay-coconut-milk-tea-700",
        name: "Coconut",
        description: "700ml",
        price: 50,
        category: "Boba Tea",
        subCategory: "700ml",
        image: coconutTea,
      },

      {
        id: "lizjay-vanilla-milk-tea-500",
        name: "Vanilla",
        description: "500ml",
        price: 40,
        category: "Boba Tea",
        subCategory: "500ml",
        image: vanillaTea,
      },
      {
        id: "lizjay-vanilla-milk-tea-700",
        name: "Vanilla",
        description: "700ml",
        price: 50,
        category: "Boba Tea",
        subCategory: "700ml",
        image: vanillaTea,
      },

      {
        id: "lizjay-strawberry-milk-tea-500",
        name: "Strawberry",
        description: "500ml",
        price: 40,
        category: "Boba Tea",
        subCategory: "500ml",
        image: strawberryTea,
      },
      {
        id: "lizjay-strawberry-milk-tea-700",
        name: "Strawberry",
        description: "700ml",
        price: 50,
        category: "Boba Tea",
        subCategory: "700ml",
        image: strawberryTea,
      },

      {
        id: "lizjay-taro-milk-tea-500",
        name: "Taro",
        description: "500ml",
        price: 40,
        category: "Boba Tea",
        subCategory: "500ml",
        image: taroTea,
      },
      {
        id: "lizjay-taro-milk-tea-700",
        name: "Taro",
        description: "700ml",
        price: 50,
        category: "Boba Tea",
        subCategory: "700ml",
        image: taroTea,
      },

      {
        id: "lizjay-purple-berry-milk-tea-500",
        name: "Purple Blueberry",
        description: "500ml",
        price: 40,
        category: "Boba Tea",
        subCategory: "500ml",
        image: purpleBlueberryTea,
      },
      {
        id: "lizjay-purple-berry-milk-tea-700",
        name: "Purple Purpleberry",
        description: "700ml",
        price: 50,
        category: "Boba Tea",
        subCategory: "700ml",
        image: purpleBlueberryTea,
      },
      {
        id: "lizjay-original-milk-tea-700",
        name: "Original Milk Tea",
        description: "700ml",
        price: 50,
        category: "Boba Tea",
        subCategory: "700ml",
        image: originalTea,
      },
    ],
  },

  // =====================================================
  // SANDWICH
  // =====================================================
  {
    id: "lizjay-sandwich",
    name: "Sandwich",
    items: [
      {
        id: "lizjay-sandwich-fries",
        name: "Sandwich with Fries",
        description: "Sandwich served with fries",
        price: 80,
        category: "Sandwich",
        image: sandwichWithFries,
      },
     /* {
        id: "lizjay-burger-fries",
        name: "Burger with Fries",
        description: "Burger served with fries",
        price: 80,
        category: "Sandwich",
        image: burgerWithFries,
      }, */
      {
        id: "lizjay-sandwich-only",
        name: "Sandwich",
        description: "Sandwich only",
        price: 50,
        category: "Sandwich",
        image: sandwich,
      },
      {
        id: "-burger-only",
        name: "Burger",
        description: "Burger only",
        price: 50,
        category: "Sandwich",
        image: burger,
      },
      {
        id: "lizjay-samosa",
        name: "Samosa",
        description: "4 pieces",
        price: 20,
        category: "Sandwich",
        image: samosa,
      },
      {
        id: "lizjay-spring-rolls",
        name: "Spring Rolls",
        description: "4 pieces",
        price: 20,
        category: "Sandwich",
        image: springRolls,
      },
    ],
  },

  // =====================================================
  // MATCHA
  // =====================================================
  {
    id: "lizjay-matcha",
    name: "Pizza",
    items: [
      {
        id: "lizjay-all-season-pizza-small",
        name: "All Season Pizza",
        description: "Small",
        price: 110,
        category: "Pizza",
        subCategory: "Small",
        image: allSeason,
      },
      {
        id: "lizjay-all-season-pizza-medium",
        name: "All Season Pizza",
        description: "Medium",
        price: 130,
        category: "Pizza",
        subCategory: "Medium",
        image: allSeason,
      },

      {
        id: "lizjay-all-season-pizza-large",
        name: "All Season Pizza",
        description: "Large",
        price: 150,
        category: "Pizza",
        subCategory: "Large",
        image: allSeason,
      },

      {
        id: "lizjay-chicken-pizza-large",
        name: "Chicken Pizza",
        description: "Large",
        price: 140,
        category: "Pizza",
        subCategory: "Large",
        image: chickenPizza,
      },
      {
        id: "lizjay-chicken-pizza-medium",
        name: "Chicken Pizza",
        description: "Medium",
        price: 120,
        category: "Pizza",
        subCategory: "Medium",
        image: chickenPizza,
      },

      {
        id: "lizjay-chicken-pizza-small",
        name: "Chicken Pizza",
        description: "Small",
        price: 100,
        category: "Pizza",
        subCategory: "Small",
        image: chickenPizza,
      },

      {
        id: "lizjay-beef-pizza-large",
        name: "Beef Pizza",
        description: "Large",
        price: 140,
        category: "Pizza",
        subCategory: "Large",
        image: beefPizza,
      },
      {
        id: "lizjay-beef-pizza-medium",
        name: "Beef Pizza",
        description: "Medium",
        price: 120,
        category: "Pizza",
        subCategory: "Medium",
        image: beefPizza,
      },

      {
        id: "lizjay-beef-pizza-small",
        name: "Beef Pizza",
        description: "Small",
        price: 100,
        category: "Pizza",
        subCategory: "Small",
        image: beefPizza,
      },

      {
        id: "lizjay-sausage-pizza-large",
        name: "Sausage Pizza",
        description: "Large",
        price: 130,
        category: "Pizza",
        subCategory: "Large",
        image: sausagePizza,
      },
      {
        id: "lizjay-sausage-pizza-medium",
        name: "Sausage Pizza",
        description: "Medium",
        price: 110,
        category: "Pizza",
        subCategory: "Medium",
        image: sausagePizza,
      },

      {
        id: "lizjay-sausage-pizza-small",
        name: "Sausage Pizza",
        description: "Small",
        price: 90,
        category: "Pizza",
        subCategory: "Small",
        image: sausagePizza,
      },

      {
        id: "lizjay-margarita-pizza-large",
        name: "Margarita Pizza",
        description: "Large",
        price: 120,
        category: "Pizza",
        subCategory: "Large",
        image: margheritaPizza,
      },
      {
        id: "lizjay-margarita-pizza-medium",
        name: "Margarita Pizza",
        description: "Medium",
        price: 100,
        category: "Pizza",
        subCategory: "Medium",
        image: margheritaPizza,
      },

      {
        id: "lizjay-margarita-pizza-small",
        name: "Margarita Pizza",
        description: "Small",
        price: 80,
        category: "Pizza",
        subCategory: "Small",
        image: margheritaPizza,
      },

      {
        id: "lizjay-pepperoni-pizza-large",
        name: "Pepperoni Pizza",
        description: "Large",
        price: 140,
        category: "Pizza",
        subCategory: "Large",
        image: pepperoniPizza,
      },
      {
        id: "lizjay-pepperoni-pizza-medium",
        name: "Pepperoni Pizza",
        description: "Medium",
        price: 120,
        category: "Pizza",
        subCategory: "Medium",
        image: pepperoniPizza,
      },

      {
        id: "lizjay-pepperoni-pizza-small",
        name: "Pepperoni Pizza",
        description: "Small",
        price: 100,
        category: "Pizza",
        subCategory: "Small",
        image: pepperoniPizza,
      },
    ],
  },
];
