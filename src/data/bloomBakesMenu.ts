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

const strawberryTea = require("../../assets/images/food/strawberry-tea.png");
const vanillaTea = require("../../assets/images/food/vanilla-tea.png");
const matchaTea = require("../../assets/images/food/matcha.png");
const coconutTea = require("../../assets/images/food/coconut-milk-tea.png");
const blueberryTea = require("../../assets/images/food/blueberry-tea.png");
const chocolateTea = require("../../assets/images/food/chocolate-milk-tea.png");
const mangoTea = require("../../assets/images/food/mango-tea.png");
const coffeeTea = require("../../assets/images/food/coffee-milk-tea.png");
const cookiesAndCreamTea = require("../../assets/images/food/cookies-and-cream-tea.png");
const bananaTea = require("../../assets/images/food/banana-tea.png");
const taroTea = require("../../assets/images/food/taro-tea.png");
const purpleBlueberryTea = require("../../assets/images/food/purple-blueberry-tea.png");

const bananaMatcha = require("../../assets/images/food/banana-matcha.png");
const mangoMatcha = require("../../assets/images/food/mango-matcha.png");
const blueberryMatcha = require("../../assets/images/food/blueberry-matcha.png");
const strawberryMatcha = require("../../assets/images/food/strawberry-matcha.png");
const coconutMatcha = require("../../assets/images/food/coconut-matcha.png");
const brownSugarMatcha = require("../../assets/images/food/brownsugar-matcha.png");
const taroMatcha = require("../../assets/images/food/taro-matcha.png");
const passionFruitMatcha = require("../../assets/images/food/passionfruit-matcha.png");
const dragonFruitMatcha = require("../../assets/images/food/dragonfruit-matcha.png");
const cookieDoughMatcha = require("../../assets/images/food/cookiedough-matcha.png");
const dragonFruit = require("../../assets/images/food/dragon-fruit.png");
const passionFruit = require("../../assets/images/food/passion-fruit.png");
const peechFruit = require("../../assets/images/food/peech-fruit.png");
const strawberryFruit = require("../../assets/images/food/strawberry-fruit.png");
const blueberryFruit = require("../../assets/images/food/blueberry-fruit.png");
const watermelonFruit = require("../../assets/images/food/watermelon-fruit.png");
const mangoFruit = require("../../assets/images/food/mango-fruit.png");

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
        image: passionFruit,
      },
      {
        id: "bloom-passion-fruit-tea-700",
        name: "Passion Fruit",
        description: "700ml",
        price: 50,
        category: "Boba Tea",
        subCategory: "700ml",
        image: passionFruit,
      },

      {
        id: "bloom-strawberry-tea-500",
        name: "Strawberry",
        description: "500ml",
        price: 40,
        category: "Boba Tea",
        subCategory: "500ml",
        image: strawberryFruit,
      },
      {
        id: "bloom-strawberry-tea-700",
        name: "Strawberry",
        description: "700ml",
        price: 50,
        category: "Boba Tea",
        subCategory: "700ml",
        image: strawberryFruit,
      },

      {
        id: "bloom-mango-tea-500",
        name: "Mango",
        description: "500ml",
        price: 40,
        category: "Boba Tea",
        subCategory: "500ml",
        image: mangoFruit,
      },
      {
        id: "bloom-mango-tea-700",
        name: "Mango",
        description: "700ml",
        price: 50,
        category: "Boba Tea",
        subCategory: "700ml",
        image: mangoFruit,
      },

      {
        id: "bloom-water-melon-tea-500",
        name: "Water Melon",
        description: "500ml",
        price: 40,
        category: "Boba Tea",
        subCategory: "500ml",
        image: watermelonFruit,
      },
      {
        id: "bloom-water-melon-tea-700",
        name: "Water Melon",
        description: "700ml",
        price: 50,
        category: "Boba Tea",
        subCategory: "700ml",
        image: watermelonFruit,
      },

      {
        id: "bloom-blueberry-tea-500",
        name: "Blueberry",
        description: "500ml",
        price: 40,
        category: "Boba Tea",
        subCategory: "500ml",
        image: blueberryFruit,
      },
      {
        id: "bloom-blueberry-tea-700",
        name: "Blueberry",
        description: "700ml",
        price: 50,
        category: "Boba Tea",
        subCategory: "700ml",
        image: blueberryFruit,
      },

      {
        id: "bloom-dragon-fruit-tea-500",
        name: "Dragon Fruit",
        description: "500ml",
        price: 40,
        category: "Boba Tea",
        subCategory: "500ml",
        image: dragonFruit,
      },
      {
        id: "bloom-dragon-fruit-tea-700",
        name: "Dragon Fruit",
        description: "700ml",
        price: 50,
        category: "Boba Tea",
        subCategory: "700ml",
        image: dragonFruit,
      },

      {
        id: "bloom-peach-tea-500",
        name: "Peach",
        description: "500ml",
        price: 40,
        category: "Boba Tea",
        subCategory: "500ml",
        image: peechFruit,
      },
      {
        id: "bloom-peach-tea-700",
        name: "Peach",
        description: "700ml",
        price: 50,
        category: "Boba Tea",
        subCategory: "700ml",
        image: peechFruit,
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
        subCategory: "500ml",
        image: brownSugarMatcha,
      },
      {
        id: "bloom-matcha-brown-sugar-700",
        name: "Brown Sugar Matcha",
        description: "700ml",
        price: 70,
        category: "Matcha",
        subCategory: "700ml",
        image: brownSugarMatcha,
      },

      {
        id: "bloom-matcha-cookie-dough-500",
        name: "Cookie Dough Matcha",
        description: "500ml",
        price: 60,
        category: "Matcha",
        subCategory: "500ml",
        image: cookieDoughMatcha,
      },
      {
        id: "bloom-matcha-cookie-dough-700",
        name: "Cookie Dough Matcha",
        description: "700ml",
        price: 70,
        category: "Matcha",
        subCategory: "700ml",
        image: cookieDoughMatcha,
      },

      {
        id: "bloom-matcha-blueberry-500",
        name: "Blueberry Matcha",
        description: "500ml",
        price: 60,
        category: "Matcha",
        subCategory: "500ml",
        image: blueberryMatcha,
      },
      {
        id: "bloom-matcha-blueberry-700",
        name: "Blueberry Matcha",
        description: "700ml",
        price: 70,
        category: "Matcha",
        subCategory: "700ml",
        image: blueberryMatcha,
      },

      {
        id: "bloom-matcha-strawberry-500",
        name: "Strawberry Matcha",
        description: "500ml",
        price: 60,
        category: "Matcha",
        subCategory: "500ml",
        image: strawberryMatcha,
      },
      {
        id: "bloom-matcha-strawberry-700",
        name: "Strawberry Matcha",
        description: "700ml",
        price: 70,
        category: "Matcha",
        subCategory: "700ml",
        image: strawberryMatcha,
      },

      {
        id: "bloom-matcha-dragon-fruit-500",
        name: "Dragon Fruit Matcha",
        description: "500ml",
        price: 60,
        category: "Matcha",
        subCategory: "500ml",
        image: dragonFruitMatcha,
      },
      {
        id: "bloom-matcha-dragon-fruit-700",
        name: "Dragon Fruit Matcha",
        description: "700ml",
        price: 70,
        category: "Matcha",
        subCategory: "700ml",
        image: dragonFruitMatcha,
      },

      {
        id: "bloom-matcha-coconut-500",
        name: "Coconut Matcha",
        description: "500ml",
        price: 60,
        category: "Matcha",
        subCategory: "500ml",
        image: coconutMatcha,
      },
      {
        id: "bloom-matcha-coconut-700",
        name: "Coconut Matcha",
        description: "700ml",
        price: 70,
        category: "Matcha",
        subCategory: "700ml",
        image: coconutMatcha,
      },

      {
        id: "bloom-matcha-taro-500",
        name: "Taro Matcha",
        description: "500ml",
        price: 60,
        category: "Matcha",
        subCategory: "500ml",
        image: taroMatcha,
      },
      {
        id: "bloom-matcha-taro-700",
        name: "Taro Matcha",
        description: "700ml",
        price: 70,
        category: "Matcha",
        subCategory: "700ml",
        image: taroMatcha,
      },

      {
        id: "bloom-matcha-mango-500",
        name: "Mango Matcha",
        description: "500ml",
        price: 60,
        category: "Matcha",
        subCategory: "500ml",
        image: mangoMatcha,
      },
      {
        id: "bloom-matcha-mango-700",
        name: "Mango Matcha",
        description: "700ml",
        price: 70,
        category: "Matcha",
        subCategory: "700ml",
        image: mangoMatcha,
      },

      {
        id: "bloom-matcha-banana-500",
        name: "Banana Matcha",
        description: "500ml",
        price: 60,
        category: "Matcha",
        subCategory: "500ml",
        image: bananaMatcha,
      },
      {
        id: "bloom-matcha-banana-700",
        name: "Banana Matcha",
        description: "700ml",
        price: 70,
        category: "Matcha",
        subCategory: "700ml",
        image: bananaMatcha,
      },

      {
        id: "bloom-matcha-passion-fruit-500",
        name: "Passion Fruit Matcha",
        description: "500ml",
        price: 60,
        category: "Matcha",
        subCategory: "500ml",
        image: passionFruitMatcha,
      },
      {
        id: "bloom-matcha-passion-fruit-700",
        name: "Passion Fruit Matcha",
        description: "700ml",
        price: 70,
        category: "Matcha",
        subCategory: "700ml",
        image: passionFruitMatcha,
      },
    ],
  },

];