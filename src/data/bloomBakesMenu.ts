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

export const bloomBakesMenu: MenuCategory[] = [
  // =====================================================
  // TEA / BOBA
  // =====================================================
  {
    id: "bloom-tea",
    name: "Tea",
    items: [
      {
        id: "bloom-chocolate-milk-tea-500",
        name: "Chocolate Milk Tea",
        description: "500ml",
        price: 40,
        category: "Tea",
        image: menuImage,
      },
      {
        id: "bloom-chocolate-milk-tea-700",
        name: "Chocolate Milk Tea",
        description: "700ml",
        price: 50,
        category: "Tea",
        image: menuImage,
      },

      {
        id: "bloom-blueberry-milk-tea-500",
        name: "Blueberry Milk Tea",
        description: "500ml",
        price: 40,
        category: "Tea",
        image: menuImage,
      },
      {
        id: "bloom-blueberry-milk-tea-700",
        name: "Blueberry Milk Tea",
        description: "700ml",
        price: 50,
        category: "Tea",
        image: menuImage,
      },

      {
        id: "bloom-coconut-milk-tea-500",
        name: "Coconut Milk Tea",
        description: "500ml",
        price: 40,
        category: "Tea",
        image: menuImage,
      },
      {
        id: "bloom-coconut-milk-tea-700",
        name: "Coconut Milk Tea",
        description: "700ml",
        price: 50,
        category: "Tea",
        image: menuImage,
      },

      {
        id: "bloom-vanilla-milk-tea-500",
        name: "Vanilla Milk Tea",
        description: "500ml",
        price: 40,
        category: "Tea",
        image: menuImage,
      },
      {
        id: "bloom-vanilla-milk-tea-700",
        name: "Vanilla Milk Tea",
        description: "700ml",
        price: 50,
        category: "Tea",
        image: menuImage,
      },

      {
        id: "bloom-strawberry-milk-tea-500",
        name: "Strawberry Milk Tea",
        description: "500ml",
        price: 40,
        category: "Tea",
        image: menuImage,
      },
      {
        id: "bloom-strawberry-milk-tea-700",
        name: "Strawberry Milk Tea",
        description: "700ml",
        price: 50,
        category: "Tea",
        image: menuImage,
      },

      {
        id: "bloom-taro-milk-tea-500",
        name: "Taro Milk Tea",
        description: "500ml",
        price: 40,
        category: "Tea",
        image: menuImage,
      },
      {
        id: "bloom-taro-milk-tea-700",
        name: "Taro Milk Tea",
        description: "700ml",
        price: 50,
        category: "Tea",
        image: menuImage,
      },

      {
        id: "bloom-brown-sugar-fresh-milk-500",
        name: "Brown Sugar Fresh Milk",
        description: "500ml",
        price: 40,
        category: "Tea",
        image: menuImage,
      },
      {
        id: "bloom-brown-sugar-fresh-milk-700",
        name: "Brown Sugar Fresh Milk",
        description: "700ml",
        price: 50,
        category: "Tea",
        image: menuImage,
      },

      {
        id: "bloom-original-milk-tea-500",
        name: "Original Milk Tea",
        description: "500ml",
        price: 40,
        category: "Tea",
        image: menuImage,
      },
      {
        id: "bloom-original-milk-tea-700",
        name: "Original Milk Tea",
        description: "700ml",
        price: 50,
        category: "Tea",
        image: menuImage,
      },

      {
        id: "bloom-purple-berry-milk-tea-500",
        name: "Purple Berry Milk Tea",
        description: "500ml",
        price: 40,
        category: "Tea",
        image: menuImage,
      },
      {
        id: "bloom-purple-berry-milk-tea-700",
        name: "Purple Berry Milk Tea",
        description: "700ml",
        price: 50,
        category: "Tea",
        image: menuImage,
      },
    ],
  },

  // =====================================================
  // SANDWICH
  // =====================================================
  {
    id: "bloom-sandwich",
    name: "Sandwich",
    items: [
      {
        id: "bloom-sandwich-fries",
        name: "Sandwich with Fries",
        description: "Sandwich served with fries",
        price: 80,
        category: "Sandwich",
        image: menuImage,
      },
      {
        id: "bloom-burger-fries",
        name: "Burger with Fries",
        description: "Burger served with fries",
        price: 80,
        category: "Sandwich",
        image: menuImage,
      },
      {
        id: "bloom-sandwich-only",
        name: "Sandwich",
        description: "Sandwich only",
        price: 50,
        category: "Sandwich",
        image: menuImage,
      },
      {
        id: "bloom-burger-only",
        name: "Burger",
        description: "Burger only",
        price: 50,
        category: "Sandwich",
        image: menuImage,
      },
      {
        id: "bloom-samosa",
        name: "Samosa",
        description: "4 pieces",
        price: 20,
        category: "Sandwich",
        image: menuImage,
      },
      {
        id: "bloom-spring-rolls",
        name: "Spring Rolls",
        description: "4 pieces",
        price: 20,
        category: "Sandwich",
        image: menuImage,
      },
    ],
  },

  // =====================================================
  // PIZZA
  // =====================================================
  {
    id: "bloom-pizza",
    name: "Pizza",
    items: [
      {
        id: "bloom-all-season-pizza-small",
        name: "All Season Pizza",
        description: "Small",
        price: 110,
        category: "Pizza",
        image: menuImage,
      },
      {
        id: "bloom-all-season-pizza-medium",
        name: "All Season Pizza",
        description: "Medium",
        price: 130,
        category: "Pizza",
        image: menuImage,
      },
      {
        id: "bloom-all-season-pizza-large",
        name: "All Season Pizza",
        description: "Large",
        price: 150,
        category: "Pizza",
        image: menuImage,
      },

      {
        id: "bloom-chicken-pizza-small",
        name: "Chicken Pizza",
        description: "Small",
        price: 100,
        category: "Pizza",
        image: menuImage,
      },
      {
        id: "bloom-chicken-pizza-medium",
        name: "Chicken Pizza",
        description: "Medium",
        price: 120,
        category: "Pizza",
        image: menuImage,
      },
      {
        id: "bloom-chicken-pizza-large",
        name: "Chicken Pizza",
        description: "Large",
        price: 140,
        category: "Pizza",
        image: menuImage,
      },

      {
        id: "bloom-beef-pizza-small",
        name: "Beef Pizza",
        description: "Small",
        price: 100,
        category: "Pizza",
        image: menuImage,
      },
      {
        id: "bloom-beef-pizza-medium",
        name: "Beef Pizza",
        description: "Medium",
        price: 120,
        category: "Pizza",
        image: menuImage,
      },
      {
        id: "bloom-beef-pizza-large",
        name: "Beef Pizza",
        description: "Large",
        price: 140,
        category: "Pizza",
        image: menuImage,
      },

      {
        id: "bloom-sausage-pizza-small",
        name: "Sausage Pizza",
        description: "Small",
        price: 90,
        category: "Pizza",
        image: menuImage,
      },
      {
        id: "bloom-sausage-pizza-medium",
        name: "Sausage Pizza",
        description: "Medium",
        price: 110,
        category: "Pizza",
        image: menuImage,
      },
      {
        id: "bloom-sausage-pizza-large",
        name: "Sausage Pizza",
        description: "Large",
        price: 130,
        category: "Pizza",
        image: menuImage,
      },

      {
        id: "bloom-margarita-pizza-small",
        name: "Margarita Pizza",
        description: "Small",
        price: 80,
        category: "Pizza",
        image: menuImage,
      },
      {
        id: "bloom-margarita-pizza-medium",
        name: "Margarita Pizza",
        description: "Medium",
        price: 100,
        category: "Pizza",
        image: menuImage,
      },
      {
        id: "bloom-margarita-pizza-large",
        name: "Margarita Pizza",
        description: "Large",
        price: 120,
        category: "Pizza",
        image: menuImage,
      },

      {
        id: "bloom-pepperoni-pizza-small",
        name: "Pepperoni Pizza",
        description: "Small",
        price: 100,
        category: "Pizza",
        image: menuImage,
      },
      {
        id: "bloom-pepperoni-pizza-medium",
        name: "Pepperoni Pizza",
        description: "Medium",
        price: 120,
        category: "Pizza",
        image: menuImage,
      },
      {
        id: "bloom-pepperoni-pizza-large",
        name: "Pepperoni Pizza",
        description: "Large",
        price: 140,
        category: "Pizza",
        image: menuImage,
      },
    ],
  },

  // =====================================================
  // MATCHA
  // =====================================================
  {
    id: "bloom-matcha",
    name: "Matcha",
    items: [
      {
        id: "bloom-matcha-brown-sugar-500",
        name: "Brown Sugar Matcha",
        description: "500ml",
        price: 60,
        category: "Matcha",
        image: menuImage,
      },
      {
        id: "bloom-matcha-brown-sugar-700",
        name: "Brown Sugar Matcha",
        description: "700ml",
        price: 70,
        category: "Matcha",
        image: menuImage,
      },

      {
        id: "bloom-matcha-cookie-dough-500",
        name: "Cookie Dough Matcha",
        description: "500ml",
        price: 60,
        category: "Matcha",
        image: menuImage,
      },
      {
        id: "bloom-matcha-cookie-dough-700",
        name: "Cookie Dough Matcha",
        description: "700ml",
        price: 70,
        category: "Matcha",
        image: menuImage,
      },

      {
        id: "bloom-matcha-blueberry-500",
        name: "Blueberry Matcha",
        description: "500ml",
        price: 60,
        category: "Matcha",
        image: menuImage,
      },
      {
        id: "bloom-matcha-blueberry-700",
        name: "Blueberry Matcha",
        description: "700ml",
        price: 70,
        category: "Matcha",
        image: menuImage,
      },

      {
        id: "bloom-matcha-strawberry-500",
        name: "Strawberry Matcha",
        description: "500ml",
        price: 60,
        category: "Matcha",
        image: menuImage,
      },
      {
        id: "bloom-matcha-strawberry-700",
        name: "Strawberry Matcha",
        description: "700ml",
        price: 70,
        category: "Matcha",
        image: menuImage,
      },

      {
        id: "bloom-matcha-dragon-fruit-500",
        name: "Dragon Fruit Matcha",
        description: "500ml",
        price: 60,
        category: "Matcha",
        image: menuImage,
      },
      {
        id: "bloom-matcha-dragon-fruit-700",
        name: "Dragon Fruit Matcha",
        description: "700ml",
        price: 70,
        category: "Matcha",
        image: menuImage,
      },

      {
        id: "bloom-matcha-coconut-500",
        name: "Coconut Matcha",
        description: "500ml",
        price: 60,
        category: "Matcha",
        image: menuImage,
      },
      {
        id: "bloom-matcha-coconut-700",
        name: "Coconut Matcha",
        description: "700ml",
        price: 70,
        category: "Matcha",
        image: menuImage,
      },

      {
        id: "bloom-matcha-taro-500",
        name: "Taro Matcha",
        description: "500ml",
        price: 60,
        category: "Matcha",
        image: menuImage,
      },
      {
        id: "bloom-matcha-taro-700",
        name: "Taro Matcha",
        description: "700ml",
        price: 70,
        category: "Matcha",
        image: menuImage,
      },

      {
        id: "bloom-matcha-mango-500",
        name: "Mango Matcha",
        description: "500ml",
        price: 60,
        category: "Matcha",
        image: menuImage,
      },
      {
        id: "bloom-matcha-mango-700",
        name: "Mango Matcha",
        description: "700ml",
        price: 70,
        category: "Matcha",
        image: menuImage,
      },

      {
        id: "bloom-matcha-banana-500",
        name: "Banana Matcha",
        description: "500ml",
        price: 60,
        category: "Matcha",
        image: menuImage,
      },
      {
        id: "bloom-matcha-banana-700",
        name: "Banana Matcha",
        description: "700ml",
        price: 70,
        category: "Matcha",
        image: menuImage,
      },

      {
        id: "bloom-matcha-passion-fruit-500",
        name: "Passion Fruit Matcha",
        description: "500ml",
        price: 60,
        category: "Matcha",
        image: menuImage,
      },
      {
        id: "bloom-matcha-passion-fruit-700",
        name: "Passion Fruit Matcha",
        description: "700ml",
        price: 70,
        category: "Matcha",
        image: menuImage,
      },
    ],
  },

  // =====================================================
  // EXTRA TOPPINGS
  // =====================================================
  {
    id: "bloom-toppings",
    name: "Extra Toppings",
    items: [
      {
        id: "bloom-boba-pearls",
        name: "Boba Pearls",
        description: "Extra boba pearls",
        price: 10,
        category: "Extra Toppings",
        image: menuImage,
      },
      {
        id: "bloom-cheese",
        name: "Cheese",
        description: "Extra cheese",
        price: 10,
        category: "Extra Toppings",
        image: menuImage,
      },
      {
        id: "bloom-vanilla-topping",
        name: "Vanilla",
        description: "Extra vanilla",
        price: 10,
        category: "Extra Toppings",
        image: menuImage,
      },
    ],
  },
];
