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
    id: "Milk Series",
    name: "Tea",
    items: [
      {
        id: "bloom-chocolate-milk-tea-500",
        name: "Chocolate",
        description: "500ml",
        price: 40,
        category: "Tea",
        image: menuImage,
      },
      {
        id: "bloom-chocolate-milk-tea-700",
        name: "Chocolate",
        description: "700ml",
        price: 50,
        category: "Tea",
        image: menuImage,
      },

      {
        id: "bloom-blueberry-milk-tea-500",
        name: "Blueberry",
        description: "500ml",
        price: 40,
        category: "Tea",
        image: menuImage,
      },
      {
        id: "bloom-blueberry-milk-tea-700",
        name: "Blueberry",
        description: "700ml",
        price: 50,
        category: "Tea",
        image: menuImage,
      },

      {
        id: "bloom-coconut-milk-tea-500",
        name: "Coconut",
        description: "500ml",
        price: 40,
        category: "Tea",
        image: menuImage,
      },
      {
        id: "bloom-coconut-milk-tea-700",
        name: "Coconut",
        description: "700ml",
        price: 50,
        category: "Tea",
        image: menuImage,
      },

      {
        id: "bloom-vanilla-milk-tea-500",
        name: "Vanilla",
        description: "500ml",
        price: 40,
        category: "Tea",
        image: menuImage,
      },
      {
        id: "bloom-vanilla-milk-tea-700",
        name: "Vanilla",
        description: "700ml",
        price: 50,
        category: "Tea",
        image: menuImage,
      },

      {
        id: "bloom-strawberry-milk-tea-500",
        name: "Strawberry",
        description: "500ml",
        price: 40,
        category: "Tea",
        image: menuImage,
      },
      {
        id: "bloom-strawberry-milk-tea-700",
        name: "Strawberry",
        description: "700ml",
        price: 50,
        category: "Tea",
        image: menuImage,
      },

      {
        id: "bloom-taro-milk-tea-500",
        name: "Taro",
        description: "500ml",
        price: 40,
        category: "Tea",
        image: menuImage,
      },
      {
        id: "bloom-taro-milk-tea-700",
        name: "Taro",
        description: "700ml",
        price: 50,
        category: "Tea",
        image: menuImage,
      },

      {
        id: "bloom-matcha-milk-tea-500",
        name: "Matcha",
        description: "500ml",
        price: 40,
        category: "Tea",
        image: menuImage,
      },
      {
        id: "bloom-matcha-milk-tea-700",
        name: "Matcha",
        description: "700ml",
        price: 50,
        category: "Tea",
        image: menuImage,
      },

      {
        id: "bloom-mango-milk-tea-500",
        name: "Mango",
        description: "500ml",
        price: 40,
        category: "Tea",
        image: menuImage,
      },
      {
        id: "bloom-mango-milk-tea-700",
        name: "Mango",
        description: "700ml",
        price: 50,
        category: "Tea",
        image: menuImage,
      },

      {
        id: "bloom-coffee-milk-tea-500",
        name: "Coffee",
        description: "500ml",
        price: 40,
        category: "Tea",
        image: menuImage,
      },
      {
        id: "bloom-coffee-milk-tea-700",
        name: "Coffee",
        description: "700ml",
        price: 50,
        category: "Tea",
        image: menuImage,
      },

      {
        id: "bloom-banana-milk-tea-500",
        name: "Banana",
        description: "500ml",
        price: 40,
        category: "Tea",
        image: menuImage,
      },
      {
        id: "banana-milk-tea-700",
        name: "Banana",
        description: "700ml",
        price: 50,
        category: "Tea",
        image: menuImage,
      },

      {
        id: "bloom-cookies-and-cream-milk-tea-500",
        name: "Mango",
        description: "500ml",
        price: 40,
        category: "Tea",
        image: menuImage,
      },
      {
        id: "bloom-cookies-and-cream-milk-tea-700",
        name: "Cookies and Cream",
        description: "700ml",
        price: 50,
        category: "Tea",
        image: menuImage,
      },

      {
        id: "bloom-purple-berry-milk-tea-500",
        name: "Purple Blueberry",
        description: "500ml",
        price: 40,
        category: "Tea",
        image: menuImage,
      },
      {
        id: "bloom-purple-berry-milk-tea-700",
        name: "Purple Purpleberry",
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
