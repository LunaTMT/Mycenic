import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useMemo,
} from "react";
import axios from "axios";
import { router } from "@inertiajs/react";


// --- Types --------------------------------------------------------

export interface CartItem {
  id: number;
  name: string;
  quantity: number;
  image: string;
  price: number;
  total: number;
  weight: number;
  addedAt?: number;
  category: string;
  isPsyilocybinSpores: boolean;
}

export interface PaymentDetails {
  cardholderName: string;
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvc: string;
}

// --- Context Type -------------------------------------------------

interface CartContextType {
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  totalItems: number;
  uniqueItems: number;

  subtotal: string;
  discountAmount: string;
  total: string;
  weight: number;

  addToCart: (item: CartItem, quantity: number) => void;
  removeFromCart: (id: number) => Promise<void>;
  updateCartQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;

  scaled: boolean;
  triggerScale: () => void;

  isModalDropdownOpen: boolean;
  toggleModalDropdown: () => void;
  setIsModalDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;

  isPromoCodeDropdownOpen: boolean;
  togglePromoCodeDropdown: () => void;
  setIsPromoCodeDropdown: React.Dispatch<React.SetStateAction<boolean>>;

  promoCode: string;
  setPromoCode: React.Dispatch<React.SetStateAction<string>>;
  promoDiscount: number;
  setPromoDiscount: React.Dispatch<React.SetStateAction<number>>;
  handlePromoCodeValidation: () => void;

  createOrder: (
    paymentIntentId: string,
    legalAgreement: boolean
  ) => void;

  getStock: (id: number) => Promise<number>;
  changeItemQuantity: (id: number, newQuantity: number) => Promise<void>;

  paymentDetails: PaymentDetails | null;
  setPaymentDetails: React.Dispatch<React.SetStateAction<PaymentDetails | null>>;

  hasPsyilocybinSporeSyringe: boolean;
}

// --- Context & Provider ------------------------------------------

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("cart") || "[]");
    } catch {
      return [];
    }
  });

  const [scaled, setScaled] = useState(false);
  const [isModalDropdownOpen, setIsModalDropdownOpen] = useState(false);
  const [isPromoCodeDropdownOpen, setIsPromoCodeDropdownOpen] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoDiscount, setPromoDiscount] = useState(0);
  


  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);

  const totalItems = useMemo(() => cart.reduce((sum, i) => sum + i.quantity, 0), [cart]);
  const uniqueItems = cart.length;

  const weight = useMemo(
    () => parseFloat(cart.reduce((sum, i) => sum + (i.weight || 0) * i.quantity, 0).toFixed(2)),
    [cart]
  );

  const subtotal = useMemo(() => cart.reduce((sum, i) => sum + i.total, 0).toFixed(2), [cart]);

  const discountAmount = useMemo(
    () => ((promoDiscount / 100) * parseFloat(subtotal)).toFixed(2),
    [promoDiscount, subtotal]
  );

  const total = useMemo(() => {
    const base = Number(subtotal) - Number(discountAmount);
    return (base).toFixed(2);
  }, [subtotal, discountAmount]);

  const hasPsyilocybinSporeSyringe = useMemo(
    () => cart.some((item) => item.category === "SPORES" && item.isPsyilocybinSpores),
    [cart]
  );

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));

    const TEN_MINUTES = 10 * 60 * 1000;
    if (cart.length && cart.every((i) => i.addedAt && Date.now() - i.addedAt > TEN_MINUTES)) {
      clearCart();
    }
  }, [cart]);

  



  const triggerScale = () => {
    setScaled(true);
    setTimeout(() => setScaled(false), 300);
  };

  const toggleModalDropdown = () => setIsModalDropdownOpen((v) => !v);
  const togglePromoCodeDropdown = () => setIsPromoCodeDropdownOpen((v) => !v);

  const clearCart = () => {
    setCart([]);
    setPromoCode("");
    setPromoDiscount(0);
  };

  const addToCart = async (item: CartItem, quantity: number) => {
    try {
      const stock = await getStock(item.id);
      if (quantity > stock) return;

      await router.post(route("item.update", { id: item.id }), {
        stock: stock - quantity,
        current_url: window.location.href,
      });

      setCart((curr) => {
        const idx = curr.findIndex((i) => i.id === item.id);
        if (idx > -1) {
          const updated = [...curr];
          const existing = updated[idx];
          updated[idx] = {
            ...existing,
            quantity: existing.quantity + quantity,
            total: existing.price * (existing.quantity + quantity),
            weight: existing.weight + item.weight * quantity,
            isPsyilocybinSpores: item.isPsyilocybinSpores ?? false,
          };
          return updated;
        }

        return [
          ...curr,
          {
            ...item,
            quantity,
            total: item.price * quantity,
            weight: item.weight * quantity,
            addedAt: Date.now(),
            isPsyilocybinSpores: item.isPsyilocybinSpores ?? false,
          },
        ];
      });

      triggerScale();
      toggleModalDropdown();
    } catch (e) {
      console.error(e);
    }
  };

  const removeFromCart = async (id: number) => {
    const item = cart.find((i) => i.id === id);
    if (!item) return;
    try {
      const stock = await getStock(id);
      await router.post(route("item.update", { id }), {
        stock: stock + item.quantity,
        current_url: route("cart"),
      });
      setCart((curr) => curr.filter((i) => i.id !== id));

      triggerScale();
    } catch (e) {
      console.error(e);
    }
  };

  const updateCartQuantity = (id: number, quantity: number) => {
    setCart((curr) =>
      curr.map((i) =>
        i.id === id ? { ...i, quantity, total: i.price * quantity } : i
      )
    );
    triggerScale();
  };

  const changeItemQuantity = async (id: number, newQuantity: number) => {
    const itm = cart.find((i) => i.id === id);
    if (!itm) return;
    try {
      const stock = await getStock(id);
      const diff = newQuantity - itm.quantity;
      if (stock >= diff) {
        await router.post(route("item.update", { id }), {
          stock: stock - diff,
          current_url: route("cart"),
        });
        updateCartQuantity(id, newQuantity);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getStock = async (id: number): Promise<number> => {
    try {
      const res = await fetch(route("item.stock", { id }));
      const d = await res.json();
      return d.stock;
    } catch {
      return 0;
    }
  };

  



  const handlePromoCodeValidation = () => {
    router.post(
      route("promo.validate"),
      { promoCode },
      {
        onSuccess: (page) => {
          const p = page.props as any;
          if (p.flash.success && p.discount) setPromoDiscount(p.discount);
          else console.error(p.error);
        },
        onError: (e) => console.error(e),
      }
    );
  };

  

  return (
    <CartContext.Provider
      value={{
        cart,
        setCart,
        totalItems,
        uniqueItems,
        subtotal,
        discountAmount,
        total,
        weight,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        scaled,
        triggerScale,
        isModalDropdownOpen,
        toggleModalDropdown,
        setIsModalDropdownOpen,
        isPromoCodeDropdownOpen,
        togglePromoCodeDropdown,
        setIsPromoCodeDropdownOpen,
        promoCode,
        setPromoCode,
        promoDiscount,
        setPromoDiscount,
        handlePromoCodeValidation,

        getStock,
        changeItemQuantity,
        paymentDetails,
        setPaymentDetails,
        hasPsyilocybinSporeSyringe,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
