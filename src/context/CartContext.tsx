import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

export type CartItem = {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  image: any;
  quantity: number;
  restaurantId: string;
  restaurantName: string;
};

export type Order = {
  id: string;
  restaurantId: string;
  restaurantName: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  total: number;
  status:
    | "pending"
    | "confirmed"
    | "preparing"
    | "ready"
    | "picked_up"
    | "on_the_way"
    | "delivered"
    | "cancelled";
  createdAt: string;
};

type CartContextType = {
  cartItems: CartItem[];
  orders: Order[];

  addToCart: (item: Omit<CartItem, "quantity">) => void;

  removeFromCart: (id: string, restaurantId: string) => void;

  increaseQuantity: (id: string, restaurantId: string) => void;

  decreaseQuantity: (id: string, restaurantId: string) => void;

  placeOrder: (deliveryFee: number, serviceFee: number) => Order | null;

  clearCart: () => void;

  cartTotal: number;
  cartCount: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "@akrobite_cart";
const ORDERS_STORAGE_KEY = "@akrobite_orders";

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // LOAD CART + ORDERS
  useEffect(() => {
    const loadData = async () => {
      try {
        const storedCart = await AsyncStorage.getItem(CART_STORAGE_KEY);

        const storedOrders = await AsyncStorage.getItem(ORDERS_STORAGE_KEY);

        if (storedCart) {
          setCartItems(JSON.parse(storedCart));
        }

        if (storedOrders) {
          setOrders(JSON.parse(storedOrders));
        }
      } catch (error) {
        console.error("Failed to load cart/orders:", error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadData();
  }, []);

  // SAVE CART
  useEffect(() => {
    if (!isLoaded) return;

    const saveCart = async () => {
      try {
        await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
      } catch (error) {
        console.error("Failed to save cart:", error);
      }
    };

    saveCart();
  }, [cartItems, isLoaded]);

  // SAVE ORDERS
  useEffect(() => {
    if (!isLoaded) return;

    const saveOrders = async () => {
      try {
        await AsyncStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
      } catch (error) {
        console.error("Failed to save orders:", error);
      }
    };

    saveOrders();
  }, [orders, isLoaded]);

  // ADD TO CART
  const addToCart = (item: Omit<CartItem, "quantity">) => {
    setCartItems((currentItems) => {
      const existingItem = currentItems.find(
        (cartItem) =>
          cartItem.id === item.id &&
          cartItem.restaurantId === item.restaurantId,
      );

      if (existingItem) {
        return currentItems.map((cartItem) =>
          cartItem.id === item.id && cartItem.restaurantId === item.restaurantId
            ? {
                ...cartItem,
                quantity: cartItem.quantity + 1,
              }
            : cartItem,
        );
      }

      return [
        ...currentItems,
        {
          ...item,
          quantity: 1,
        },
      ];
    });
  };

  // REMOVE FROM CART
  const removeFromCart = (id: string, restaurantId: string) => {
    setCartItems((currentItems) =>
      currentItems.filter(
        (item) => !(item.id === id && item.restaurantId === restaurantId),
      ),
    );
  };

  // INCREASE QUANTITY
  const increaseQuantity = (id: string, restaurantId: string) => {
    setCartItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id && item.restaurantId === restaurantId
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item,
      ),
    );
  };

  // DECREASE QUANTITY
  const decreaseQuantity = (id: string, restaurantId: string) => {
    setCartItems((currentItems) =>
      currentItems
        .map((item) =>
          item.id === id && item.restaurantId === restaurantId
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  // PLACE ORDER
  const placeOrder = (
    deliveryFee: number,
    serviceFee: number,
  ): Order | null => {
    if (cartItems.length === 0) {
      return null;
    }

    const restaurantId = cartItems[0].restaurantId;

    const restaurantName = cartItems[0].restaurantName;

    const subtotal = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const total = subtotal + deliveryFee + serviceFee;

    const newOrder: Order = {
      id: `ORD-${Date.now()}`,
      restaurantId,
      restaurantName,
      items: [...cartItems],
      subtotal,
      deliveryFee,
      serviceFee,
      total,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    // ADD ORDER TO ORDERS STATE
    setOrders((currentOrders) => [newOrder, ...currentOrders]);

    // CLEAR CART AFTER SUCCESSFUL ORDER
    setCartItems([]);

    // RETURN THE CREATED ORDER
    return newOrder;
  };

  // CLEAR CART
  const clearCart = () => {
    setCartItems([]);
  };

  // CART TOTAL
  const cartTotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  // CART COUNT
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        orders,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        placeOrder,
        clearCart,
        cartTotal,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}
