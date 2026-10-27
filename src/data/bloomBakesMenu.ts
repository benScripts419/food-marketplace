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
const matchaTea = require("../../assets/images/food/matcha-tea.png");
const coconutTea = require("../../assets/images/food/coconut-milk-tea.jpg");
const blueberryTea = require("../../assets/images/food/blueberry-tea.jpg");
const chocolateTea = require("../../assets/images/food/chocolate-milk-tea.jpg");
const mangoTea = require("../../assets/images/food/mango-tea.jpg");
const coffeeTea = require("../../assets/images/food/coffee-milk-tea.jpg");
const cookiesAndCreamTea = require("../../assets/images/food/cookies-and-cream-tea.jpg");
const bananaTea = require("../../assets/images/food/banana-tea.jpg");
const taroTea = require("../../assets/images/food/taro-tea.png");
const purpleBlueberryTea = require("../../assets/images/food/purple-blueberry-tea.png");
const vanila = require("../../assets/images/food/vanilla.jpg");
const cheese = require("../../assets/images/food/cheese.jpg");
const bobaPearls = require("../../assets/images/food/boba-pearls.jpg");




export const bloomBakesMenu: MenuCategory[] = [
  // =====================================================
  // TEA / BOBA
  // =====================================================
  {
    id: "milk-series",
    name: "Boba Tea",
    items: [
      {
        id: "bloom-chocolate-milk-tea-500",
        name: "Chocolate",
        description: "500ml",
        price: 40,
        category: "Boba Tea",
        subCategory: "500ml",
        image: chocolateTea,
      },
      {
        id: "bloom-chocolate-milk-tea-700",
        name: "Chocolate",
        description: "700ml",
        price: 50,
        category: "Boba Tea",
        subCategory: "700ml",
        image: chocolateTea,
      },

      {
        id: "bloom-blueberry-milk-tea-500",
        name: "Blueberry",
        description: "500ml",
        price: 40,
        category: "Boba Tea",
        subCategory: "500ml",
        image: blueberryTea,
      },
      {
        id: "bloom-blueberry-milk-tea-700",
        name: "Blueberry",
        description: "700ml",
        price: 50,
        category: "Boba Tea",
        subCategory: "700ml",
        image: blueberryTea,
      },

      {
        id: "bloom-coconut-milk-tea-500",
        name: "Coconut",
        description: "500ml",
        price: 40,
        category: "Boba Tea",
        subCategory: "500ml",
        image: coconutTea,
      },
      {
        id: "bloom-coconut-milk-tea-700",
        name: "Coconut",
        description: "700ml",
        price: 50,
        category: "Boba Tea",
        subCategory: "700ml",
        image: coconutTea,
      },

      {
        id: "bloom-vanilla-milk-tea-500",
        name: "Vanilla",
        description: "500ml",
        price: 40,
        category: "Boba Tea",
        subCategory: "500ml",
        image: vanillaTea,
      },
      {
        id: "bloom-vanilla-milk-tea-700",
        name: "Vanilla",
        description: "700ml",
        price: 50,
        category: "Boba Tea",
        subCategory: "700ml",
        image: vanillaTea,
      },

      {
        id: "bloom-strawberry-milk-tea-500",
        name: "Strawberry",
        description: "500ml",
        price: 40,
        category: "Boba Tea",
        subCategory: "500ml",
        image: strawberryTea,
      },
      {
        id: "bloom-strawberry-milk-tea-700",
        name: "Strawberry",
        description: "700ml",
        price: 50,
        category: "Boba Tea",
        subCategory: "700ml",
        image: strawberryTea,
      },

      {
        id: "bloom-taro-milk-tea-500",
        name: "Taro",
        description: "500ml",
        price: 40,
        category: "Boba Tea",
        subCategory: "500ml",
        image: taroTea,
      },
      {
        id: "bloom-taro-milk-tea-700",
        name: "Taro",
        description: "700ml",
        price: 50,
        category: "Boba Tea",
        subCategory: "700ml",
        image: taroTea,
      },

      {
        id: "bloom-matcha-milk-tea-500",
        name: "Matcha",
        description: "500ml",
        price: 40,
        category: "Boba Tea",
        subCategory: "500ml",
        image: matchaTea,
      },
      {
        id: "bloom-matcha-milk-tea-700",
        name: "Matcha",
        description: "700ml",
        price: 50,
        category: "Boba Tea",
        subCategory: "700ml",
        image: matchaTea,
      },

      {
        id: "bloom-mango-milk-tea-500",
        name: "Mango",
        description: "500ml",
        price: 40,
        category: "Boba Tea",
        subCategory: "500ml",
        image: mangoTea,
      },
      {
        id: "bloom-mango-milk-tea-700",
        name: "Mango",
        description: "700ml",
        price: 50,
        category: "Boba Tea",
        subCategory: "700ml",
        image: mangoTea,
      },

      {
        id: "bloom-coffee-milk-tea-500",
        name: "Coffee",
        description: "500ml",
        price: 40,
        category: "Boba Tea",
        subCategory: "500ml",
        image: coffeeTea,
      },
      {
        id: "bloom-coffee-milk-tea-700",
        name: "Coffee",
        description: "700ml",
        price: 50,
        category: "Boba Tea",
        subCategory: "700ml",
        image: coffeeTea,
      },

      {
        id: "bloom-banana-milk-tea-500",
        name: "Banana",
        description: "500ml",
        price: 40,
        category: "Boba Tea",
        subCategory: "500ml",
        image: bananaTea,
      },
      {
        id: "banana-milk-tea-700",
        name: "Banana",
        description: "700ml",
        price: 50,
        category: "Boba Tea",
        subCategory: "700ml",
        image: bananaTea,
      },

      {
        id: "bloom-cookies-and-cream-milk-tea-500",
        name: "Cookies and Cream",
        description: "500ml",
        price: 40,
        category: "Boba Tea",
        subCategory: "500ml",
        image: cookiesAndCreamTea,
      },
      {
        id: "bloom-cookies-and-cream-milk-tea-700",
        name: "Cookies and Cream",
        description: "700ml",
        price: 50,
        category: "Boba Tea",
        subCategory: "700ml",
        image: cookiesAndCreamTea,
      },

      {
        id: "bloom-purple-berry-milk-tea-500",
        name: "Purple Blueberry",
        description: "500ml",
        price: 40,
        category: "Boba Tea",
        subCategory: "500ml",
        image: purpleBlueberryTea,
      },
      {
        id: "bloom-purple-berry-milk-tea-700",
        name: "Purple Purpleberry",
        description: "700ml",
        price: 50,
        category: "Boba Tea",
        subCategory: "700ml",
        image: purpleBlueberryTea,
      },
    ],
  },

  // =====================================================
  // Fruit Tea Series
  // =====================================================
 
  {
    id: "fruit-tea-series",
    name: "FruitTea Series",
    items: [
      {
        id: "bloom-passion-fruit-tea-500",
        name: "Passion Fruit",
        description: "500ml",
        price: 40,
        category: "Boba Tea",
        subCategory: "500ml",
        image: chocolateTea,
      },
      {
        id: "bloom-passion-fruit-tea-700",
        name: "Passion Fruit",
        description: "700ml",
        price: 50,
        category: "Boba Tea",
        subCategory: "700ml",
        image: chocolateTea,
      },
    
      {
        id: "bloom-strawberry-tea-500",
        name: "Strawberry",
        description: "500ml",
        price: 40,
        category: "Boba Tea",
        subCategory: "500ml",
        image: chocolateTea,
      },
      {
        id: "bloom-strawberry-tea-700",
        name: "Strawberry",
        description: "700ml",
        price: 50,
        category: "Boba Tea",
        subCategory: "700ml",
        image: chocolateTea,
      },
    
      {
        id: "bloom-mango-tea-500",
        name: "Mango",
        description: "500ml",
        price: 40,
        category: "Boba Tea",
        subCategory: "500ml",
        image: chocolateTea,
      },
      {
        id: "bloom-mango-tea-700",
        name: "Mango",
        description: "700ml",
        price: 50,
        category: "Boba Tea",
        subCategory: "700ml",
        image: chocolateTea,
      },
    
      {
        id: "bloom-water-melon-tea-500",
        name: "Water Melon",
        description: "500ml",
        price: 40,
        category: "Boba Tea",
        subCategory: "500ml",
        image: chocolateTea,
      },
      {
        id: "bloom-water-melon-tea-700",
        name: "Water Melon",
        description: "700ml",
        price: 50,
        category: "Boba Tea",
        subCategory: "700ml",
        image: chocolateTea,
      },
    
      {
        id: "bloom-blueberry-tea-500",
        name: "Blueberry",
        description: "500ml",
        price: 40,
        category: "Boba Tea",
        subCategory: "500ml",
        image: chocolateTea,
      },
      {
        id: "bloom-blueberry-tea-700",
        name: "Blueberry",
        description: "700ml",
        price: 50,
        category: "Boba Tea",
        subCategory: "700ml",
        image: chocolateTea,
      },
    
      {
        id: "bloom-dragon-fruit-tea-500",
        name: "Dragon Fruit",
        description: "500ml",
        price: 40,
        category: "Boba Tea",
        subCategory: "500ml",
        image: chocolateTea,
      },
      {
        id: "bloom-dragon-fruit-tea-700",
        name: "Dragon Fruit",
        description: "700ml",
        price: 50,
        category: "Boba Tea",
        subCategory: "700ml",
        image: chocolateTea,
      },
    
      {
        id: "bloom-peach-tea-500",
        name: "Peach",
        description: "500ml",
        price: 40,
        category: "Boba Tea",
        subCategory: "500ml",
        image: chocolateTea,
      },
      {
        id: "bloom-peach-tea-700",
        name: "Peach",
        description: "700ml",
        price: 50,
        category: "Boba Tea",
        subCategory: "700ml",
        image: chocolateTea,
      },]
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
        subCategory: "500ml",
        image: menuImage,
      },
      {
        id: "bloom-matcha-brown-sugar-700",
        name: "Brown Sugar Matcha",
        description: "700ml",
        price: 70,
        category: "Matcha",
        subCategory: "700ml",
        image: menuImage,
      },

      {
        id: "bloom-matcha-cookie-dough-500",
        name: "Cookie Dough Matcha",
        description: "500ml",
        price: 60,
        category: "Matcha",
        subCategory: "500ml",
        image: menuImage,
      },
      {
        id: "bloom-matcha-cookie-dough-700",
        name: "Cookie Dough Matcha",
        description: "700ml",
        price: 70,
        category: "Matcha",
        subCategory: "700ml",
        image: menuImage,
      },

      {
        id: "bloom-matcha-blueberry-500",
        name: "Blueberry Matcha",
        description: "500ml",
        price: 60,
        category: "Matcha",
        subCategory: "500ml",
        image: menuImage,
      },
      {
        id: "bloom-matcha-blueberry-700",
        name: "Blueberry Matcha",
        description: "700ml",
        price: 70,
        category: "Matcha",
        subCategory: "700ml",
        image: menuImage,
      },

      {
        id: "bloom-matcha-strawberry-500",
        name: "Strawberry Matcha",
        description: "500ml",
        price: 60,
        category: "Matcha",
        subCategory: "500ml",
        image: menuImage,
      },
      {
        id: "bloom-matcha-strawberry-700",
        name: "Strawberry Matcha",
        description: "700ml",
        price: 70,
        category: "Matcha",
        subCategory: "700ml",
        image: menuImage,
      },

      {
        id: "bloom-matcha-dragon-fruit-500",
        name: "Dragon Fruit Matcha",
        description: "500ml",
        price: 60,
        category: "Matcha",
        subCategory: "500ml",
        image: menuImage,
      },
      {
        id: "bloom-matcha-dragon-fruit-700",
        name: "Dragon Fruit Matcha",
        description: "700ml",
        price: 70,
        category: "Matcha",
        subCategory: "700ml",
        image: menuImage,
      },

      {
        id: "bloom-matcha-coconut-500",
        name: "Coconut Matcha",
        description: "500ml",
        price: 60,
        category: "Matcha",
        subCategory: "500ml",
        image: menuImage,
      },
      {
        id: "bloom-matcha-coconut-700",
        name: "Coconut Matcha",
        description: "700ml",
        price: 70,
        category: "Matcha",
        subCategory: "700ml",
        image: menuImage,
      },

      {
        id: "bloom-matcha-taro-500",
        name: "Taro Matcha",
        description: "500ml",
        price: 60,
        category: "Matcha",
        subCategory: "500ml",
        image: menuImage,
      },
      {
        id: "bloom-matcha-taro-700",
        name: "Taro Matcha",
        description: "700ml",
        price: 70,
        category: "Matcha",
        subCategory: "700ml",
        image: menuImage,
      },

      {
        id: "bloom-matcha-mango-500",
        name: "Mango Matcha",
        description: "500ml",
        price: 60,
        category: "Matcha",
        subCategory: "500ml",
        image: menuImage,
      },
      {
        id: "bloom-matcha-mango-700",
        name: "Mango Matcha",
        description: "700ml",
        price: 70,
        category: "Matcha",
        subCategory: "700ml",
        image: menuImage,
      },

      {
        id: "bloom-matcha-banana-500",
        name: "Banana Matcha",
        description: "500ml",
        price: 60,
        category: "Matcha",
        subCategory: "500ml",
        image: menuImage,
      },
      {
        id: "bloom-matcha-banana-700",
        name: "Banana Matcha",
        description: "700ml",
        price: 70,
        category: "Matcha",
        subCategory: "700ml",
        image: menuImage,
      },

      {
        id: "bloom-matcha-passion-fruit-500",
        name: "Passion Fruit Matcha",
        description: "500ml",
        price: 60,
        category: "Matcha",
        subCategory: "500ml",
        image: menuImage,
      },
      {
        id: "bloom-matcha-passion-fruit-700",
        name: "Passion Fruit Matcha",
        description: "700ml",
        price: 70,
        category: "Matcha",
        subCategory: "700ml",
        image: menuImage,
      },
    ],
  },
];