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

const eggFriedRice = require("../../assets/images/food/fried-rice.jpg");

export const fiftyCentMenu: MenuCategory[] = [
  {
    id: "50-cent-main-dishes",
    name: "Main Dishes",
    items: [
      {
        id: "50-cent-fried-rice-small",
        name: "Fried Rice",
        description: "Small",
        price: 30,
        category: "Fast Food",
        subCategory: "Small",
        image: eggFriedRice,
      },
      {
        id: "50-cent-fried-rice-medium",
        name: "Fried Rice",
        description: "Medium",
        price: 40,
        category: "Fast Food",
        subCategory: "Medium",
        image: eggFriedRice,
      },
      {
        id: "50-cent-fried-rice-large",
        name: "Fried Rice",
        description: "Large",
        price: 50,
        category: "Fast Food",
        subCategory: "Large",
        image: eggFriedRice,
      },
      {
        id: "50-cent-fried-rice-jumbo-pack",
        name: "Fried Rice",
        description: "Jumbo Pack",
        price: 60,
        category: "Fast Food",
        subCategory: "Jumbo Pack",
        image: eggFriedRice,
      },
    ],
  },
];
