import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Alert } from "react-native";

const FAVORITES_STORAGE_KEY = "@akrobite_favorite_restaurants";

type FavoritesContextValue = {
  favoriteRestaurantIds: string[];
  favoritesLoaded: boolean;
  isFavorite: (restaurantId: string) => boolean;
  toggleFavorite: (restaurantId: string) => Promise<void>;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favoriteRestaurantIds, setFavoriteRestaurantIds] = useState<string[]>(
    [],
  );
  const [favoritesLoaded, setFavoritesLoaded] = useState(false);
  const favoriteIdsRef = useRef<string[]>([]);

  useEffect(() => {
    let mounted = true;

    async function loadFavorites() {
      try {
        const storedFavorites = await AsyncStorage.getItem(
          FAVORITES_STORAGE_KEY,
        );
        if (!storedFavorites) return;

        const parsed: unknown = JSON.parse(storedFavorites);
        if (
          !Array.isArray(parsed) ||
          !parsed.every((id): id is string => typeof id === "string")
        ) {
          throw new Error("Saved favorite restaurant data is invalid.");
        }

        if (mounted) {
          const uniqueIds = [...new Set(parsed)];
          favoriteIdsRef.current = uniqueIds;
          setFavoriteRestaurantIds(uniqueIds);
        }
      } catch (error) {
        console.error("Could not load favorite restaurants:", error);
        Alert.alert(
          "Favorites unavailable",
          "Your saved restaurants could not be loaded on this device.",
        );
      } finally {
        if (mounted) setFavoritesLoaded(true);
      }
    }

    void loadFavorites();
    return () => {
      mounted = false;
    };
  }, []);

  const isFavorite = useCallback(
    (restaurantId: string) => favoriteRestaurantIds.includes(restaurantId),
    [favoriteRestaurantIds],
  );

  const toggleFavorite = useCallback(async (restaurantId: string) => {
    const previousIds = favoriteIdsRef.current;
    const nextIds = previousIds.includes(restaurantId)
      ? previousIds.filter((id) => id !== restaurantId)
      : [...previousIds, restaurantId];

    favoriteIdsRef.current = nextIds;
    setFavoriteRestaurantIds(nextIds);

    try {
      await AsyncStorage.setItem(
        FAVORITES_STORAGE_KEY,
        JSON.stringify(nextIds),
      );
    } catch (error) {
      favoriteIdsRef.current = previousIds;
      setFavoriteRestaurantIds(previousIds);
      console.error("Could not save favorite restaurants:", error);
      throw new Error("Your favorites could not be saved. Please try again.");
    }
  }, []);

  return (
    <FavoritesContext.Provider
      value={{
        favoriteRestaurantIds,
        favoritesLoaded,
        isFavorite,
        toggleFavorite,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used inside a FavoritesProvider");
  }
  return context;
}
