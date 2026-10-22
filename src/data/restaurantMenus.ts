import { fiftyCentMenu } from "./50centMenu";
import { bloomBakesMenu } from "./bloomBakesMenu";
import { brackersInnMenu } from "./brackersInnMenu";
import { conceptMenu } from "./conceptMenu";
import { kwayisibeaMenu } from "./kwayisibeaMenu";
import { lizjaysMenu } from "./lizjaysMenu";
import { rolldUpMenu } from "./rolldUpMenu";

export type MenuItem = {
  id: string;
  name: string;
  description?: string;
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

// --------------------------------------------------
// OLD NUMERIC MENU MAPPING
// --------------------------------------------------

export const restaurantMenus: Record<string, MenuCategory[]> = {
  "1": kwayisibeaMenu,
  "2": conceptMenu,
  "3": brackersInnMenu,
  "4": bloomBakesMenu,
  "5": rolldUpMenu,
  "50": fiftyCentMenu,
};

// --------------------------------------------------
// RESTAURANT NAME → MENU
// --------------------------------------------------

export const restaurantMenusByName: Record<string, MenuCategory[]> = {
  "Kwayisibea Hotel": kwayisibeaMenu,
  "Concept": conceptMenu,
  "Brackers Inn": brackersInnMenu,
  "Bloom Bakes": bloomBakesMenu,
  "Roll'd Up Shawarma": rolldUpMenu,
  "Lizjay's Eatery": lizjaysMenu,
  "Boba Buzz": lizjaysMenu,
  "50 Cent": fiftyCentMenu,
  "Thebloom Boba Tea": fiftyCentMenu,
  "Pam's Check Check": [],
};

// --------------------------------------------------
// NORMALIZE RESTAURANT NAME
// --------------------------------------------------

const normalizeRestaurantName = (name: string) => {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
};

// --------------------------------------------------
// GET MENU BY RESTAURANT NAME
// --------------------------------------------------

export const getRestaurantMenuByName = (
  restaurantName: string,
): MenuCategory[] => {
  const normalizedName = normalizeRestaurantName(restaurantName);

  const match = Object.entries(restaurantMenusByName).find(
    ([name]) => normalizeRestaurantName(name) === normalizedName,
  );

  return match ? match[1] : [];
};

// --------------------------------------------------
// GET MENU BY OLD RESTAURANT ID
// --------------------------------------------------

export const getRestaurantMenu = (restaurantId: string): MenuCategory[] => {
  return restaurantMenus[restaurantId] ?? [];
};

// --------------------------------------------------
// GET ALL MENU ITEMS
// --------------------------------------------------

export const getAllMenuItems = (): (MenuItem & {
  restaurantId: string;
  restaurantName: string;
})[] => {
  return Object.entries(restaurantMenusByName).flatMap(
    ([restaurantName, categories]) =>
      categories.flatMap((category) =>
        category.items.map((item) => ({
          ...item,
          restaurantId: restaurantName,
          restaurantName,
        })),
      ),
  );
};
