import { bloomBakesMenu } from "./bloomBakesMenu";
import { brachersInnMenu } from "./brackersInnMenu";
import { kwayisibeaMenu } from "./kwayisibeaMenu";

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

export const restaurantMenus: Record<string, MenuCategory[]> = {
  "1": kwayisibeaMenu,

  // Bloom Bakes
  "7": bloomBakesMenu,

  // Brachers Inn
  "8": brachersInnMenu,
};

export const getRestaurantMenu = (restaurantId: string): MenuCategory[] => {
  return restaurantMenus[restaurantId] ?? [];
};

export const getAllMenuItems = (): (MenuItem & {
  restaurantId: string;
})[] => {
  return Object.entries(restaurantMenus).flatMap(([restaurantId, categories]) =>
    categories.flatMap((category) =>
      category.items.map((item) => ({
        ...item,
        restaurantId,
      })),
    ),
  );
};
