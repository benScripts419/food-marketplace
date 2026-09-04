export type MenuItem = {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  image: any;
};

export type MenuCategory = {
  id: string;
  name: string;
  items: MenuItem[];
};

// This file is inside src/data,
// so ../../ reaches the project root.
const kwMixedSalad = require("../../assets/images/food/mixed-salad.jpg");
const greekSalad = require("../../assets/images/food/greek-salad.jpg");
const chickenCeasarSalad = require("../../assets/images/food/chicken-ceasar-salad.jpg");
const chickenSalad = require("../../assets/images/food/chicken-salad.jpg");
const exoticCoselaw = require("../../assets/images/food/exotic-coselaw.png");
const vegetableRice = require("../../assets/images/food/vegetable-rice.jpg");
const eggFriedRice = require("../../assets/images/food/egg-fried-rice.jpg");
const assortedFriedRice = require("../../assets/images/food/assorted-fried-rice.jpg");
const assortedJollofRice = require("../../assets/images/food/assorted-jollof-rice.jpg");
const jollofRice = require("../../assets/images/food/jollof-rice.jpg");
const steamedRice = require("../../assets/images/food/steamed-rice.jpg");
const frenchFries = require("../../assets/images/food/french-fries.jpg");
const mashedPotatoes = require("../../assets/images/food/mashed-potatoes.jpg");
const fufu = require("../../assets/images/food/fufu.jpg");
const banku = require("../../assets/images/food/banku.jpg");
const friedPlantain = require("../../assets/images/food/fried-plantain.jpg");
const kelewele = require("../../assets/images/food/kelewele.jpg");
const omoTuo = require("../../assets/images/food/omo-tuo.jpg");
const yamChips = require("../../assets/images/food/yam-chips.jpg");
const akple = require("../../assets/images/food/akple.jpg");

const foodImage = require("@/assets/images/food/mixed-salad.jpg");

export const kwayisibeaMenu: MenuCategory[] = [
  {
    id: "starters",
    name: "Starters",
    items: [
      {
        id: "kw-starter-1",
        name: "Kwayisibea Mixed Salad",
        description:
          "Lettuce, cucumber, onions, tomatoes, tuna, eggs, baked beans, avocado and fruits.",
        price: 80,
        category: "Starters",
        image: kwMixedSalad,
      },
      {
        id: "kw-starter-2",
        name: "Greek Salad",
        description: "Lettuce, cucumber, onions, tomatoes and feta cheese.",
        price: 80,
        category: "Starters",
        image: greekSalad,
      },
      {
        id: "kw-starter-3",
        name: "Chicken Caesar Salad",
        description:
          "Flaked chicken, lettuce, cucumber, onions, croutons and cheese.",
        price: 100,
        category: "Starters",
        image: chickenCeasarSalad,
      },
      {
        id: "kw-starter-4",
        name: "Chicken Salad",
        description: "Lettuce, cucumber, onions, tomatoes and chicken strips.",
        price: 100,
        category: "Starters",
        image: chickenSalad,
      },
      {
        id: "kw-starter-5",
        name: "Exotic Coleslaw Salad",
        description: "Cabbage, carrot, onions, assorted fruits and mayonnaise.",
        price: 50,
        category: "Starters",
        image: exoticCoselaw,
      },
    ],
  },
  {
    id: "side orders",
    name: "Side Orders",
    items: [
      {
        id: "side-orders-1",
        name: "Egg Fried Rice",
        price: 30,
        category: "Side Orders",
        image: eggFriedRice,
      },
      {
        id: "side-orders-2",
        name: "Assorted Fried Rice",
        price: 150,
        category: "Side Orders",
        image: assortedFriedRice,
      },
      {
        id: "side-orders-3",
        name: "Jollof Rice",
        price: 30,
        category: "Side Orders",
        image: jollofRice,
      },
      {
        id: "side-orders-4",
        name: "Assorted Jollof Rice",
        price: 150,
        category: "Side Orders",
        image: assortedJollofRice,
      },
      {
        id: "side-orders-5",
        name: "Steamed Rice",
        price: 30,
        category: "Side Orders",
        image: steamedRice,
      },
      {
        id: "side-orders-6",
        name: "Vegetable Rice",
        price: 30,
        category: "Side Orders",
        image: vegetableRice,
      },

      {
        id: "side-orders-7",
        name: "French Fries",
        price: 40,
        category: "Side Orders",
        image: frenchFries,
      },
      {
        id: "side-orders-8",
        name: "Mashed Potatoes",
        price: 40,
        category: "Side Orders",
        image: mashedPotatoes,
      },
      {
        id: "side-orders-9",
        name: "Kelewele",
        price: 40,
        category: "Side Orders",
        image: kelewele,
      },
      {
        id: "side-orders-10",
        name: "Fufu",
        price: 40,
        category: "Side Orders",
        image: fufu,
      },
      {
        id: "side-orders-11",
        name: "Banku",
        price: 20,
        category: "Side Orders",
        image: banku,
      },
      {
        id: "side-orders-12",
        name: "Omo Tuo",
        price: 30,
        category: "Side Orders",
        image: omoTuo,
      },
      {
        id: "side-orders-13",
        name: "Yam Chips",
        price: 30,
        category: "Side Orders",
        image: yamChips,
      },
      {
        id: "side-orders-14",
        name: "Akple",
        price: 30,
        category: "Side Orders",
        image: akple,
      },
      {
        id: "side-orders-15",
        name: "Konkonte",
        price: 30,
        category: "Side Orders",
        image: foodImage,
      },
      {
        id: "side-orders-16",
        name: "Fried Plantain",
        price: 30,
        category: "Side Orders",
        image: friedPlantain,
      },
    ],
  },
  {
    id: "poultry",
    name: "Poultry",
    items: [
      {
        id: "kw-poultry-1",
        name: "Chicken Kiev",
        description: "Stuffed chicken with parsley garlic butter.",
        price: 90,
        category: "Poultry",
        image: foodImage,
      },
      {
        id: "kw-poultry-2",
        name: "Chicken Curry",
        description: "Chicken pieces in coconut curry sauce.",
        price: 90,
        category: "Poultry",
        image: foodImage,
      },
      {
        id: "kw-poultry-3",
        name: "Chicken Cordon Bleu",
        description: "Ham and cheese stuffed in chicken.",
        price: 100,
        category: "Poultry",
        image: foodImage,
      },
      {
        id: "kw-poultry-4",
        name: "Spicy Chicken Wings",
        price: 80,
        category: "Poultry",
        image: foodImage,
      },
      {
        id: "kw-poultry-5",
        name: "Honey Chicken Wings",
        price: 80,
        category: "Poultry",
        image: foodImage,
      },
      {
        id: "kw-poultry-6",
        name: "Spicy Chicken Pieces",
        price: 90,
        category: "Poultry",
        image: foodImage,
      },
      {
        id: "kw-poultry-7",
        name: "Marinated Grilled Chicken",
        description: "Well-Seasoned oven grilled chicken.",
        price: 90,
        category: "Poultry",
        image: foodImage,
      },
    ],
  },
  {
    id: "local corner",
    name: "Local Corner",
    items: [
      {
        id: "kw-local-1",
        name: "Spicy Grilled Tilapia",
        price: 150,
        category: "Local Corner",
        image: foodImage,
      },
      {
        id: "kw-local-2",
        name: "Tilapia Light Soup",
        price: 130,
        category: "Local Corner",
        image: foodImage,
      },
      {
        id: "kw-local-3",
        name: "Assorted Fish and Meat Okro Stew",
        price: 100,
        category: "Local Corner",
        image: foodImage,
      },
      {
        id: "kw-local-4",
        name: "Goat Light Soup",
        price: 130,
        category: "130",
        image: foodImage,
      },
      {
        id: "kw-local-5",
        name: "Fish Beans Stew",
        price: 80,
        category: "Local Corner",
        image: foodImage,
      },
      {
        id: "kw-local-6",
        name: "Fish and Wele Palava Sauce",
        price: 80,
        category: "Local Corner",
        image: foodImage,
      },
      {
        id: "kw-local-7",
        name: "Assorted Meat and Dry Fish Ebunu Ebunu Soup",
        price: 100,
        category: "Local Corner",
        image: foodImage,
      },
      {
        id: "kw-local-8",
        name: "Spicy Grilled/Fried Goat Meat",
        price: 130,
        category: "Local Corner",
        image: foodImage,
      },
      {
        id: "kw-local-9",
        name: "Fish Garden Egg Stew",
        price: 80,
        category: "Local Corner",
        image: foodImage,
      },
      {
        id: "kw-local-10",
        name: "Assorted Meat and Fish Palmnut Soup",
        price: 150,
        category: "Local Corner",
        image: foodImage,
      },
    ],
  },
  {
    id: "snacks",
    name: "Snacks",
    items: [
      {
        id: "kw-snack-1",
        name: "Kwayisibea Club Sandwich",
        description:
          "Lettuce, onion, tomato, chicken, bacon and toasted bread.",
        price: 100,
        category: "Snacks",
        image: foodImage,
      },
      {
        id: "kw-snack-2",
        name: "Supreme Tuna Sandwich",
        description: "Tuna flakes, onions, mayonnaise and toasted bread.",
        price: 80,
        category: "Snacks",
        image: foodImage,
      },
      {
        id: "kw-snack-3",
        name: "Beef Burger",
        description: "Grilled beef patty in burger bun.",
        price: 80,
        category: "Snacks",
        image: foodImage,
      },
      {
        id: "kw-snack-4",
        name: "Vegetable Spring Rolls",
        price: 50,
        category: "Snacks",
        image: foodImage,
      },
      {
        id: "kw-snack-5",
        name: "Beef Spring Rolls",
        price: 50,
        category: "Snacks",
        image: foodImage,
      },
      {
        id: "kw-snack-7",
        name: "Spicy Chicken Burger",
        price: 100,
        category: "Snacks",
        image: foodImage,
      },
      {
        id: "kw-snack-8",
        name: "Cheese Burger",
        price: 150,
        category: "Snacks",
        image: foodImage,
      },
    ],
  },

  {
    id: "vegetarian",
    name: "Vegetarian",
    items: [
      {
        id: "kw-veg-1",
        name: "Vegetarian Soup",
        price: 60,
        category: "Vegetarian",
        image: foodImage,
      },
      {
        id: "kw-veg-2",
        name: "Veggie Sandwich",
        price: 70,
        category: "Vegetarian",
        image: foodImage,
      },
      {
        id: "kw-veg-3",
        name: "Penne Arrabiata",
        price: 70,
        category: "Vegetarian",
        image: foodImage,
      },
      {
        id: "kw-veg-4",
        name: "Margherita Pizza",
        description: "Cheese, tomato, oregano and olive oil.",
        price: 100,
        category: "Vegetarian",
        image: foodImage,
      },
    ],
  },

  {
    id: "pizzas",
    name: "Pizzas",
    items: [
      {
        id: "kw-pizza-1",
        name: "Margherita Pizza",
        description: "Cheese, tomato, oregano and olive oil.",
        price: 100,
        category: "Pizzas",
        image: foodImage,
      },
      {
        id: "kw-pizza-2",
        name: "Chicken Pizza",
        price: 130,
        category: "Pizzas",
        image: foodImage,
      },
      {
        id: "kw-pizza-3",
        name: "Kwayisibea Special All Season Pizza",
        description:
          "Chicken, beef, tuna, sausage, mushroom, special herbs and cheese.",
        price: 150,
        category: "Pizzas",
        image: foodImage,
      },
      {
        id: "kw-pizza-4",
        name: "Seafood Pizza",
        description: "Shrimps, squid and cheese.",
        price: 200,
        category: "Pizzas",
        image: foodImage,
      },
      {
        id: "kw-pizza-5",
        name: "Tuna Pizza",
        description: "Tuna flakes, cheese and olive oil.",
        price: 130,
        category: "Pizzas",
        image: foodImage,
      },
      {
        id: "kw-pizza-6",
        name: "Hawaii Pizza",
        description: "Ham, pineapple and cheese.",
        price: 100,
        category: "Pizzas",
        image: foodImage,
      },
      {
        id: "kw-pizza-7",
        name: "Pepperoni Pizza",
        description: "Pepperoni, cheese and black olives.",
        price: 150,
        category: "Pizzas",
        image: foodImage,
      },
    ],
  },

  {
    id: "pork-beef-grill",
    name: "Pork, Beef & Grill",
    items: [
      {
        id: "kw-grill-1",
        name: "Pork Chops",
        description: "Oven grilled honey mustard pork chops.",
        price: 140,
        category: "Pork, Beef & Grill",
        image: foodImage,
      },
      {
        id: "kw-grill-2",
        name: "Beef Sauce",
        description: "Shredded beef in brown vegetable sauce.",
        price: 140,
        category: "Pork, Beef & Grill",
        image: foodImage,
      },
      {
        id: "kw-grill-3",
        name: "Beef Peppered Steak",
        description: "Grilled tender beef fillet in peppercorn sauce.",
        price: 140,
        category: "Pork, Beef & Grill",
        image: foodImage,
      },
      {
        id: "kw-grill-4",
        name: "Spicy Pork Pieces",
        description: "Grilled pork pieces in chili sauce.",
        price: 140,
        category: "Pork, Beef & Grill",
        image: foodImage,
      },
      {
        id: "kw-grill-5",
        name: "Chinese Beef Stir Fry",
        price: 140,
        category: "Pork, Beef & Grill",
        image: foodImage,
      },
      {
        id: "kw-grill-6",
        name: "Honey & Mustard Grilled Beef",
        description: "Beef strips in vegetable sauce.",
        price: 140,
        category: "Pork, Beef & Grill",
        image: foodImage,
      },
      {
        id: "kw-grill-7",
        name: "Chicken Kebab",
        price: 70,
        category: "Pork, Beef & Grill",
        image: foodImage,
      },
      {
        id: "kw-grill-8",
        name: "Beef Kebab",
        price: 80,
        category: "Pork, Beef & Grill",
        image: foodImage,
      },
      {
        id: "kw-grill-9",
        name: "Squid Kebab",
        price: 70,
        category: "Pork, Beef & Grill",
        image: foodImage,
      },
      {
        id: "kw-grill-10",
        name: "Oven Grilled Pork Chop",
        price: 150,
        category: "Pork, Beef & Grill",
        image: foodImage,
      },
    ],
  },
  {
    id: "italian pastas",
    name: "Italian Pastas",
    items: [
      {
        id: "italian-pasta-1",
        name: "Spaghetti Carbonara",
        description: "Spaghetti in bacon and egg creamy sauce.",
        price: 150,
        category: "Italian Pastas",
        image: foodImage,
      },
      {
        id: "italian-pasta-2",
        name: "Spaghetti Bolognaise",
        description: "Spaghetti in minced meat sauce.",
        price: 100,
        category: "Italian Pastas",
        image: foodImage,
      },
      {
        id: "italian-pasta-3",
        name: "Penne Arrabiata",
        description: "Boiled Penne pasta in spicy tomato basil sauce.",
        price: 70,
        category: "Italian Pastas",
        image: foodImage,
      },
    ],
  },
];

export const kwayisibeaRestaurant = {
  id: "1",
  name: "Kwayisibea Hotel",
  rating: "4.5",
  reviews: "—",
  time: "30–40 min",
  fee: "GH₵10",
  cuisine: "Ghanaian • Continental • Grills",
  offer: false,
  menu: kwayisibeaMenu,
};
