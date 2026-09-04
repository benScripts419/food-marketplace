type Restaurant = {
  id: string;
  name: string;
  image: any;
  rating: string;
  reviews: string;
  time: string;
  fee: string;
  cuisine: string;
  offer: boolean;
};

type RestaurantCardProps = {
  restaurant: Restaurant;
};
