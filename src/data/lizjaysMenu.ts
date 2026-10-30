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
const strawberryTea = require("../../assets/images/food/strawberry-tea.jpg");
const vanillaTea = require("../../assets/images/food/vanilla-tea.jpg");
const coconutTea = require("../../assets/images/food/coconut-milk-tea.jpg");
const blueberryTea = require("../../assets/images/food/blueberry-tea.jpg");
const chocolateTea = require("../../assets/images/food/chocolate-milk-tea.jpg");
const taroTea = require("../../assets/images/food/taro-tea.png");
const purpleBlueberryTea = require("../../assets/images/food/purple-blueberry-tea.png");

const sandwich = require("../../assets/images/food/sandwich.jpg");
const burger = require("../../assets/images/food/burger.jpg");
const samosa = require("../../assets/images/food/samosa.jpg");
const springRolls = require("../../assets/images/food/spring-rolls.jpeg");
const sandwichWithFries = require("../../assets/images/food/sandwich-fries.jpg");

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
        image: purpleBlueberryTea,
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
        image: menuImage,
      },
      {
        id: "lizjay-all-season-pizza-medium",
        name: "All Season Pizza",
        description: "Medium",
        price: 130,
        category: "Pizza",
        subCategory: "Medium",
        image: menuImage,
      },

      {
        id: "lizjay-all-season-pizza-large",
        name: "All Season Pizza",
        description: "Large",
        price: 150,
        category: "Pizza",
        subCategory: "Large",
        image: menuImage,
      },

      {
        id: "lizjay-chicken-pizza-large",
        name: "Chicken Pizza",
        description: "Large",
        price: 140,
        category: "Pizza",
        subCategory: "Large",
        image: menuImage,
      },
      {
        id: "lizjay-chicken-pizza-medium",
        name: "Chicken Pizza",
        description: "Medium",
        price: 120,
        category: "Pizza",
        subCategory: "Medium",
        image: menuImage,
      },

      {
        id: "lizjay-chicken-pizza-small",
        name: "Chicken Pizza",
        description: "Small",
        price: 100,
        category: "Pizza",
        subCategory: "Small",
        image: menuImage,
      },

      {
        id: "lizjay-beef-pizza-large",
        name: "Beef Pizza",
        description: "Large",
        price: 140,
        category: "Pizza",
        subCategory: "Large",
        image: menuImage,
      },
      {
        id: "lizjay-beef-pizza-medium",
        name: "Beef Pizza",
        description: "Medium",
        price: 120,
        category: "Pizza",
        subCategory: "Medium",
        image: menuImage,
      },

      {
        id: "lizjay-beef-pizza-small",
        name: "Beef Pizza",
        description: "Small",
        price: 100,
        category: "Pizza",
        subCategory: "Small",
        image: menuImage,
      },

      {
        id: "lizjay-sausage-pizza-large",
        name: "Sausage Pizza",
        description: "Large",
        price: 130,
        category: "Pizza",
        subCategory: "Large",
        image: menuImage,
      },
      {
        id: "lizjay-sausage-pizza-medium",
        name: "Sausage Pizza",
        description: "Medium",
        price: 110,
        category: "Pizza",
        subCategory: "Medium",
        image: menuImage,
      },

      {
        id: "lizjay-sausage-pizza-small",
        name: "Sausage Pizza",
        description: "Small",
        price: 90,
        category: "Pizza",
        subCategory: "Small",
        image: menuImage,
      },

      {
        id: "lizjay-margarita-pizza-large",
        name: "Margarita Pizza",
        description: "Large",
        price: 120,
        category: "Pizza",
        subCategory: "Large",
        image: menuImage,
      },
      {
        id: "lizjay-margarita-pizza-medium",
        name: "Margarita Pizza",
        description: "Medium",
        price: 100,
        category: "Pizza",
        subCategory: "Medium",
        image: menuImage,
      },

      {
        id: "lizjay-margarita-pizza-small",
        name: "Margarita Pizza",
        description: "Small",
        price: 80,
        category: "Pizza",
        subCategory: "Small",
        image: menuImage,
      },

      {
        id: "lizjay-pepperoni-pizza-large",
        name: "Pepperoni Pizza",
        description: "Large",
        price: 140,
        category: "Pizza",
        subCategory: "Large",
        image: menuImage,
      },
      {
        id: "lizjay-pepperoni-pizza-medium",
        name: "Pepperoni Pizza",
        description: "Medium",
        price: 120,
        category: "Pizza",
        subCategory: "Medium",
        image: menuImage,
      },

      {
        id: "lizjay-pepperoni-pizza-small",
        name: "Pepperoni Pizza",
        description: "Small",
        price: 100,
        category: "Pizza",
        subCategory: "Small",
        image: menuImage,
      },
    ],
  },
];
