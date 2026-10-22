import { supabase } from "@/lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const CART_STORAGE_KEY = "@akrobite_cart";
const FREE_SELECTIONS_STORAGE_KEY = "@akrobite_free_item_selections";

// Roll'd Up restaurant UUID
const ROLLD_UP_RESTAURANT_ID = "0a7aae53-94c5-428c-88c5-3e6cd88ee911";

// Wednesday = 3
const PROMOTION_DAY = 3;

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

type FreeItemSelection = {
  itemId: string;
  restaurantId: string;
};

type OrderItem = {
  id: string;
  name: string;
  quantity: number;
  price: number;
};

type Order = {
  id: string;
  status: string;
  cancellationReason: string | null;
  refundStatus: string | null;
  paymentStatus: string | null;
  adminConfirmed: boolean;
  createdAt: string;
  restaurantName: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  total: number;
};

type OrderRow = {
  id: string;
  status: string;
  cancellation_reason: string | null;
  refund_status: string | null;
  payment_status: string | null;
  admin_confirmed_at: string | null;
  created_at: string;
  subtotal: number;
  delivery_fee: number;
  service_fee: number;
  total: number;
  order_items:
    | {
        id: string;
        name: string | null;
        item_name: string | null;
        quantity: number;
        price: number | null;
        unit_price: number | null;
        restaurant_name: string | null;
      }[]
    | null;
};

type CartContextType = {
  cartItems: CartItem[];
  cartCount: number;
  cartSubtotal: number;
  promotionDiscount: number;
  cartTotal: number;

  isPromotionActive: boolean;

  // Promotion prompt
  freeItemPromptVisible: boolean;
  pendingFreeItemSelection: boolean;

  freeItemSelections: FreeItemSelection[];

  addToCart: (item: Omit<CartItem, "quantity">) => void;

  selectFreeItem: (item: Omit<CartItem, "quantity">) => void;

  dismissFreeItemPrompt: () => void;

  removeFromCart: (id: string, restaurantId: string) => void;
  increaseQuantity: (id: string, restaurantId: string) => void;
  decreaseQuantity: (id: string, restaurantId: string) => void;

  clearCart: () => void;

  orders: Order[];
  refreshOrders: () => Promise<void>;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

type CartProviderProps = {
  children: ReactNode;
};

export function CartProvider({ children }: CartProviderProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const [freeItemSelections, setFreeItemSelections] = useState<
    FreeItemSelection[]
  >([]);

  const [freeItemPromptVisible, setFreeItemPromptVisible] = useState(false);

  // --------------------------------------------------
  // LOAD STORED CART
  // --------------------------------------------------

  useEffect(() => {
    let mounted = true;

    const loadStoredData = async () => {
      try {
        const [storedCart, storedFreeSelections] = await Promise.all([
          AsyncStorage.getItem(CART_STORAGE_KEY),
          AsyncStorage.getItem(FREE_SELECTIONS_STORAGE_KEY),
        ]);

        if (!mounted) return;

        if (storedCart) {
          try {
            const parsedCart: CartItem[] = JSON.parse(storedCart);

            if (Array.isArray(parsedCart)) {
              setCartItems(parsedCart);
            }
          } catch (error) {
            console.error("Failed to parse stored cart:", error);
          }
        }

        if (storedFreeSelections) {
          try {
            const parsedSelections: FreeItemSelection[] =
              JSON.parse(storedFreeSelections);

            if (Array.isArray(parsedSelections)) {
              setFreeItemSelections(parsedSelections);
            }
          } catch (error) {
            console.error("Failed to parse stored free selections:", error);
          }
        }
      } catch (error) {
        console.error("Failed to load cart data:", error);
      }
    };

    loadStoredData();

    return () => {
      mounted = false;
    };
  }, []);

  // --------------------------------------------------
  // SAVE CART
  // --------------------------------------------------

  useEffect(() => {
    const saveCart = async () => {
      try {
        await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
      } catch (error) {
        console.error("Failed to save cart:", error);
      }
    };

    saveCart();
  }, [cartItems]);

  // --------------------------------------------------
  // SAVE FREE SELECTIONS
  // --------------------------------------------------

  useEffect(() => {
    const saveFreeSelections = async () => {
      try {
        await AsyncStorage.setItem(
          FREE_SELECTIONS_STORAGE_KEY,
          JSON.stringify(freeItemSelections),
        );
      } catch (error) {
        console.error("Failed to save free-item selections:", error);
      }
    };

    saveFreeSelections();
  }, [freeItemSelections]);

  // --------------------------------------------------
  // PROMOTION ACTIVE
  // --------------------------------------------------

  const isPromotionActive = useMemo(() => {
    return new Date().getUTCDay() === PROMOTION_DAY;
  }, []);

  const getFreeSelectionCount = useCallback(
    (selections: FreeItemSelection[], restaurantId: string) => {
      return selections.filter(
        (selection) => selection.restaurantId === restaurantId,
      ).length;
    },
    [],
  );

  const getPaidItemCount = useCallback(
    (
      items: CartItem[],
      selections: FreeItemSelection[],
      restaurantId: string,
    ) => {
      return items
        .filter((item) => item.restaurantId === restaurantId)
        .reduce((total, item) => {
          const freeQuantity = selections.filter(
            (selection) =>
              selection.restaurantId === restaurantId &&
              selection.itemId === item.id,
          ).length;

          return total + Math.max(0, item.quantity - freeQuantity);
        }, 0);
    },
    [],
  );

  // --------------------------------------------------
  // PAID ROLL'D UP ITEMS
  // --------------------------------------------------

  const paidQualifyingItemCount = useMemo(() => {
    return getPaidItemCount(
      cartItems,
      freeItemSelections,
      ROLLD_UP_RESTAURANT_ID,
    );
  }, [cartItems, freeItemSelections, getPaidItemCount]);

  // --------------------------------------------------
  // FREE ITEMS ALREADY SELECTED
  // --------------------------------------------------

  const selectedFreeItemCount = useMemo(() => {
    return getFreeSelectionCount(freeItemSelections, ROLLD_UP_RESTAURANT_ID);
  }, [freeItemSelections, getFreeSelectionCount]);

  // --------------------------------------------------
  // NUMBER OF FREE ITEMS UNLOCKED
  //
  // 3 paid = 1 free
  // 6 paid = 2 free
  // 9 paid = 3 free
  // --------------------------------------------------

  const freeItemsUnlocked = useMemo(() => {
    if (!isPromotionActive) {
      return 0;
    }

    return Math.floor(paidQualifyingItemCount / 3);
  }, [paidQualifyingItemCount, isPromotionActive]);

  // --------------------------------------------------
  // IS THERE A FREE ITEM WAITING TO BE SELECTED?
  // --------------------------------------------------

  const pendingFreeItemSelection = useMemo(() => {
    return selectedFreeItemCount < freeItemsUnlocked;
  }, [selectedFreeItemCount, freeItemsUnlocked]);

  // --------------------------------------------------
  // DISMISS PROMPT
  // --------------------------------------------------

  const dismissFreeItemPrompt = useCallback(() => {
    setFreeItemPromptVisible(false);
  }, []);

  // --------------------------------------------------
  // ADD TO CART
  //
  // IMPORTANT:
  // This checks whether the new item causes the user
  // to reach 3, 6, 9, etc.
  // --------------------------------------------------

  const addToCart = useCallback(
    (item: Omit<CartItem, "quantity">) => {
      setCartItems((currentItems) => {
        const isRollDUp = item.restaurantId === ROLLD_UP_RESTAURANT_ID;

        const currentPaidCount = isRollDUp
          ? getPaidItemCount(
              currentItems,
              freeItemSelections,
              ROLLD_UP_RESTAURANT_ID,
            )
          : 0;

        const newPaidCount = currentPaidCount + 1;

        const previousUnlocked = Math.floor(currentPaidCount / 3);
        const newUnlocked = Math.floor(newPaidCount / 3);

        const hasNewFreeItem =
          isRollDUp && isPromotionActive && newUnlocked > previousUnlocked;

        const existingItem = currentItems.find(
          (cartItem) =>
            cartItem.id === item.id &&
            cartItem.restaurantId === item.restaurantId,
        );

        const updatedItems = existingItem
          ? currentItems.map((cartItem) =>
              cartItem.id === item.id &&
              cartItem.restaurantId === item.restaurantId
                ? {
                    ...cartItem,
                    quantity: cartItem.quantity + 1,
                  }
                : cartItem,
            )
          : [
              ...currentItems,
              {
                ...item,
                quantity: 1,
              },
            ];

        if (hasNewFreeItem) {
          setTimeout(() => {
            setFreeItemPromptVisible(true);
          }, 100);
        }

        return updatedItems;
      });
    },
    [freeItemSelections, getPaidItemCount, isPromotionActive],
  );

  // --------------------------------------------------
  // SELECT FREE ITEM
  // --------------------------------------------------

  const selectFreeItem = useCallback(
    (item: Omit<CartItem, "quantity">) => {
      if (!isPromotionActive) {
        return;
      }

      if (item.restaurantId !== ROLLD_UP_RESTAURANT_ID) {
        return;
      }

      const currentPaidCount = getPaidItemCount(
        cartItems,
        freeItemSelections,
        ROLLD_UP_RESTAURANT_ID,
      );
      const unlockedCount = Math.floor(currentPaidCount / 3);
      const selectedCount = getFreeSelectionCount(
        freeItemSelections,
        ROLLD_UP_RESTAURANT_ID,
      );

      if (selectedCount >= unlockedCount) {
        return;
      }

      setFreeItemSelections((currentSelections) => [
        ...currentSelections,
        {
          itemId: item.id,
          restaurantId: item.restaurantId,
        },
      ]);

      setCartItems((currentItems) => {
        const existingItem = currentItems.find(
          (cartItem) =>
            cartItem.id === item.id &&
            cartItem.restaurantId === item.restaurantId,
        );

        if (existingItem) {
          return currentItems.map((cartItem) =>
            cartItem.id === item.id &&
            cartItem.restaurantId === item.restaurantId
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

      setFreeItemPromptVisible(false);
    },
    [
      cartItems,
      freeItemSelections,
      getFreeSelectionCount,
      getPaidItemCount,
      isPromotionActive,
    ],
  );

  // --------------------------------------------------
  // REMOVE ITEM
  // --------------------------------------------------

  const removeFromCart = useCallback((id: string, restaurantId: string) => {
    setCartItems((currentItems) =>
      currentItems.filter(
        (item) => !(item.id === id && item.restaurantId === restaurantId),
      ),
    );

    setFreeItemSelections((currentSelections) =>
      currentSelections.filter(
        (selection) =>
          !(selection.itemId === id && selection.restaurantId === restaurantId),
      ),
    );
  }, []);

  // --------------------------------------------------
  // INCREASE QUANTITY
  // --------------------------------------------------

  const increaseQuantity = useCallback(
    (id: string, restaurantId: string) => {
      setCartItems((currentItems) => {
        const currentItem = currentItems.find(
          (item) => item.id === id && item.restaurantId === restaurantId,
        );

        if (!currentItem) {
          return currentItems;
        }

        const isRollDUp = restaurantId === ROLLD_UP_RESTAURANT_ID;

        if (isRollDUp && isPromotionActive) {
          const currentPaidCount = getPaidItemCount(
            currentItems,
            freeItemSelections,
            ROLLD_UP_RESTAURANT_ID,
          );

          const newPaidCount = currentPaidCount + 1;
          const previousUnlocked = Math.floor(currentPaidCount / 3);
          const newUnlocked = Math.floor(newPaidCount / 3);

          if (newUnlocked > previousUnlocked) {
            setTimeout(() => {
              setFreeItemPromptVisible(true);
            }, 100);
          }
        }

        return currentItems.map((item) =>
          item.id === id && item.restaurantId === restaurantId
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item,
        );
      });
    },
    [freeItemSelections, getPaidItemCount, isPromotionActive],
  );

  // --------------------------------------------------
  // DECREASE QUANTITY
  // --------------------------------------------------

  const decreaseQuantity = useCallback((id: string, restaurantId: string) => {
    setCartItems((currentItems) => {
      const updatedItems = currentItems
        .map((item) =>
          item.id === id && item.restaurantId === restaurantId
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item,
        )
        .filter((item) => item.quantity > 0);

      const cartItem = updatedItems.find(
        (item) => item.id === id && item.restaurantId === restaurantId,
      );

      setFreeItemSelections((currentSelections) => {
        const selectionsForItem = currentSelections.filter(
          (selection) =>
            selection.itemId === id && selection.restaurantId === restaurantId,
        );

        if (!cartItem) {
          return currentSelections.filter(
            (selection) =>
              !(
                selection.itemId === id &&
                selection.restaurantId === restaurantId
              ),
          );
        }

        const newQuantity = cartItem.quantity;

        if (newQuantity <= 0) {
          return currentSelections.filter(
            (selection) =>
              !(
                selection.itemId === id &&
                selection.restaurantId === restaurantId
              ),
          );
        }

        if (selectionsForItem.length > newQuantity) {
          let selectionsToKeep = newQuantity;

          return currentSelections.filter((selection) => {
            if (
              selection.itemId === id &&
              selection.restaurantId === restaurantId
            ) {
              if (selectionsToKeep > 0) {
                selectionsToKeep--;
                return true;
              }

              return false;
            }

            return true;
          });
        }

        return currentSelections;
      });

      return updatedItems;
    });
  }, []);

  // --------------------------------------------------
  // CLEAR CART
  // --------------------------------------------------

  const clearCart = useCallback(() => {
    setCartItems([]);
    setFreeItemSelections([]);
    setFreeItemPromptVisible(false);
  }, []);

  // --------------------------------------------------
  // CART COUNT
  // --------------------------------------------------

  const cartCount = useMemo(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems]);

  // --------------------------------------------------
  // SUBTOTAL
  // --------------------------------------------------

  const cartSubtotal = useMemo(() => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );
  }, [cartItems]);

  // --------------------------------------------------
  // PROMOTION DISCOUNT
  // --------------------------------------------------

  const promotionDiscount = useMemo(() => {
    if (!isPromotionActive) {
      return 0;
    }

    let discount = 0;

    freeItemSelections.forEach((selection) => {
      const cartItem = cartItems.find(
        (item) =>
          item.id === selection.itemId &&
          item.restaurantId === selection.restaurantId,
      );

      if (cartItem) {
        discount += cartItem.price;
      }
    });

    return discount;
  }, [cartItems, freeItemSelections, isPromotionActive]);

  // --------------------------------------------------
  // TOTAL
  // --------------------------------------------------

  const cartTotal = useMemo(() => {
    return Math.max(0, cartSubtotal - promotionDiscount);
  }, [cartSubtotal, promotionDiscount]);

  // --------------------------------------------------
  // ORDERS
  // --------------------------------------------------

  const refreshOrders = useCallback(async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const user = session?.user;

      if (!user) {
        setOrders([]);
        return;
      }

      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("customer_id", user.id)
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        console.error("Failed to load orders:", error);
        setOrders([]);
        return;
      }

      const orderRows = (data ?? []) as OrderRow[];
      setOrders(
        orderRows.map((row) => {
          const items = (row.order_items ?? []).map((item) => ({
            id: item.id,
            name: item.name ?? item.item_name ?? "Menu item",
            quantity: Number(item.quantity),
            price: Number(item.price ?? item.unit_price ?? 0),
          }));
          const restaurantNames = [
            ...new Set(
              (row.order_items ?? [])
                .map((item) => item.restaurant_name)
                .filter((name): name is string => Boolean(name)),
            ),
          ];

          return {
            id: row.id,
            status: row.status,
            cancellationReason: row.cancellation_reason,
            refundStatus: row.refund_status,
            paymentStatus: row.payment_status,
            adminConfirmed: Boolean(row.admin_confirmed_at),
            createdAt: row.created_at,
            restaurantName: restaurantNames.join(", ") || "Your order",
            items,
            subtotal: Number(row.subtotal),
            deliveryFee: Number(row.delivery_fee),
            serviceFee: Number(row.service_fee),
            total: Number(row.total),
          };
        }),
      );
    } catch (error) {
      console.error("Unexpected error loading orders:", error);
      setOrders([]);
    }
  }, []);

  useEffect(() => {
    void refreshOrders();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") {
        void refreshOrders();
      }
    });

    return () => subscription.unsubscribe();
  }, [refreshOrders]);
  // --------------------------------------------------
  // CONTEXT VALUE
  // --------------------------------------------------

  const value = useMemo<CartContextType>(
    () => ({
      cartItems,
      cartCount,
      cartSubtotal,
      promotionDiscount,
      cartTotal,

      isPromotionActive,

      freeItemPromptVisible,
      pendingFreeItemSelection,

      freeItemSelections,

      addToCart,
      selectFreeItem,
      dismissFreeItemPrompt,

      removeFromCart,
      increaseQuantity,
      decreaseQuantity,

      clearCart,

      orders,
      refreshOrders,
    }),
    [
      cartItems,
      cartCount,
      cartSubtotal,
      promotionDiscount,
      cartTotal,

      isPromotionActive,

      freeItemPromptVisible,
      pendingFreeItemSelection,

      freeItemSelections,

      addToCart,
      selectFreeItem,
      dismissFreeItemPrompt,

      removeFromCart,
      increaseQuantity,
      decreaseQuantity,

      clearCart,

      orders,
      refreshOrders,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextType {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside a CartProvider");
  }

  return context;
}
