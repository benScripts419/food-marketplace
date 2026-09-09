export type DatabaseRestaurant = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  address: string;
  rating: number;
  review_count: number;
  delivery_minutes: string;
  delivery_fee: number;
  has_offer: boolean;
  cuisine: string;
  is_open: boolean;
};

export type DatabaseMenuCategory = {
  id: string;
  restaurant_id: string;
  name: string;
  sort_order: number;
};

export type DatabaseMenuItem = {
  id: string;
  restaurant_id: string;
  category_id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_available: boolean;
};
