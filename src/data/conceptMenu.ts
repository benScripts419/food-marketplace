export type MenuItem = {
  id: string;
  name: string;
  price: number;
  category: string;
  image: any;
};

export type MenuCategory = {
  id: string;
  name: string;
  items: MenuItem[];
};

const kwMixedSalad = require("../../assets/images/food/mixed-salad.jpg");

export const conceptMenu: MenuCategory[] = [
  {
    id: "shawarma",
    name: "Shawarma",
    items: [
      {
        id: "rolld-up-1",
        name: "Chicken Pack",
        price: 40,
        category: "shawarma",
        image: kwMixedSalad,
      },
      {
        id: "rolld-up-2",
        name: "Beef Pack",
        price: 50,
        category: "shawarma",
        image: kwMixedSalad,
      },
      {
        id: "rolld-up-3",
        name: "Combo Pack",
        price: 100,
        category: "shawarma",
        image: kwMixedSalad,
      },
    ],
  },
];
