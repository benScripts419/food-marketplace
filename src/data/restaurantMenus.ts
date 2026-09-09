import { bloomBakesMenu } from "./bloomBakesMenu";
import { brachersInnMenu } from "./brackersInnMenu";
import { conceptMenu } from "./conceptMenu";
import { kwayisibeaMenu } from "./kwayisibeaMenu";
import { rolldUpMenu } from "./rolldUpMenu";

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
  "2": conceptMenu,
  "3": brachersInnMenu,

  "4": bloomBakesMenu,
  "5": rolldUpMenu,
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
