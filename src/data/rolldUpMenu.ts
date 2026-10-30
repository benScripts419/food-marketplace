export type MenuItem = {
  id: string;
  name: string;
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

const kwMixedSalad = require("../../assets/images/food/mixed-salad.jpg");
const chickenShawarma = require("../../assets/images/food/chicken-shawarma.jpg");
const beefShawarma = require("../../assets/images/food/beef-shawarma.jpg");

export const rolldUpMenu: MenuCategory[] = [
  {
    id: "shawarma",
    name: "Shawarma",
    items: [
      {
        id: "rolld-up-1",
        name: "Chicken Pack",
        price: 40,
        category: "Shawarma",
        subCategory: "Chicken Pack",
        image: chickenShawarma,
      },
      {
        id: "rolld-up-2",
        name: "Chicken Pack",
        price: 50,
        category: "Shawarma",
        subCategory: "Chicken Pack",
        image: chickenShawarma,
      },
      {
        id: "rolld-up-3",
        name: "Chicken Pack",
        price: 60,
        category: "Shawarma",
        subCategory: "Chicken Pack",
        image: chickenShawarma,
      },
      {
        id: "rolld-up-4",
        name: "Chicken Pack",
        price: 70,
        category: "Shawarma",
        subCategory: "Chicken Pack",
        image: chickenShawarma,
      },
      {
        id: "rolld-up-5",
        name: "Chicken Pack",
        price: 80,
        category: "Shawarma",
        subCategory: "Chicken Pack",
        image: chickenShawarma,
      },
      {
        id: "rolld-up-6",
        name: "Beef Pack",
        price: 50,
        category: "Shawarma",
        subCategory: "Beef Pack",
        image: beefShawarma,
      },
      {
        id: "rolld-up-7",
        name: "Beef Pack",
        price: 60,
        category: "Shawarma",
        subCategory: "Beef Pack",
        image: beefShawarma,
      },
      {
        id: "rolld-up-8",
        name: "Beef Pack",
        price: 70,
        category: "Shawarma",
        subCategory: "Beef Pack",
        image: beefShawarma,
      },
      {
        id: "rolld-up-9",
        name: "Beef Pack",
        price: 80,
        category: "Shawarma",
        subCategory: "Beef Pack",
        image: beefShawarma,
      },
      {
        id: "rolld-up-10",
        name: "Beef Pack",
        price: 90,
        category: "Shawarma",
        subCategory: "Beef Pack",
        image: beefShawarma,
      },
      {
        id: "rolld-up-11",
        name: "Combo Pack",
        price: 100,
        category: "Shawarma",
        subCategory: "Combo Pack",
        image: kwMixedSalad,
      },
    ],
  },
];
