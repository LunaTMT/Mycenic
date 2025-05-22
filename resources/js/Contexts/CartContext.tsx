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

      export interface ShippingDetails {
        name: string;
        phone: string;
        address: string;
        city: string;
        zip: string;
        email: string;
      }

      export interface ShippingRate {
        amount: string;
        provider: string;
        service: string;
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

        rates: ShippingRate[];
        fetchShippingEstimate: () => Promise<void>;
        fetchShippingRates: () => Promise<void>;
        shippingCostEstimate: [number, number];
        setShippingCostEstimate: React.Dispatch<React.SetStateAction<[number, number]>>;

        shippingDetails: ShippingDetails | null;
        setShippingDetails: React.Dispatch<React.SetStateAction<ShippingDetails | null>>;

        shippingCost: number;
        setShippingCost: React.Dispatch<React.SetStateAction<number>>;

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
        ) => void; // The function signature

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
        const [rates, setRates] = useState<ShippingRate[]>([]);
        const [shippingCostEstimate, setShippingCostEstimate] = useState<[number, number]>([0, 0]);
        
        const [shippingCost, setShippingCost] = useState<number>(() => {
          const stored = localStorage.getItem("shippingCost");
          return stored ? parseFloat(stored) : 0;
        });
        useEffect(() => {
          localStorage.setItem("shippingCost", shippingCost.toString());
        }, [shippingCost]);


        const [shippingDetails, setShippingDetails] = useState<ShippingDetails | null>(() => {
          try {
            const stored = localStorage.getItem("shippingDetails")
            return stored ? JSON.parse(stored) : null
          } catch {
            return null
          }
        })
        useEffect(() => {
          if (shippingDetails) {
            localStorage.setItem("shippingDetails", JSON.stringify(shippingDetails))
          } else {
            localStorage.removeItem("shippingDetails")
          }
        }, [shippingDetails])
        
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
          
          console.log(base, shippingCost);
          return (base + shippingCost).toFixed(2);
        }, [subtotal, discountAmount, shippingCost, shippingCostEstimate]);


        
        const hasPsyilocybinSporeSyringe = useMemo(
          () => cart.some((item) => item.category === "SPORES" && item.isPsyilocybinSpores),
          [cart]
        );




        useEffect(() => {
          localStorage.setItem("cart", JSON.stringify(cart));

          const TEN_MINUTES = 10 * 60 * 1000;
          if (cart.length && cart.every(i => i.addedAt && Date.now() - i.addedAt > TEN_MINUTES)) {
            clearCart();
          }
        }, [cart]);

        const triggerScale = () => {
          setScaled(true);
          setTimeout(() => setScaled(false), 300);
        };

        const toggleModalDropdown = () => setIsModalDropdownOpen(v => !v);
        const togglePromoCodeDropdown = () => setIsPromoCodeDropdownOpen(v => !v);

        const clearCart = () => {
          setCart([]);
          setPromoCode("");
          setPromoDiscount(0);
        };

        const addToCart = async (item: CartItem, quantity: number) => {
          console.log("cart context ", item);
          try {
            const stock = await getStock(item.id);
            if (quantity > stock) return;

            await router.post(route("item.update", { id: item.id }), {
              stock: stock - quantity,
              current_url: window.location.href,
            });

            setCart(curr => {
              const idx = curr.findIndex(i => i.id === item.id);
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
                }
              ];
            });

          


            console.log("🛒 Cart contents:");
            cart.forEach((item, index) => {
              console.log(`Item ${index + 1}:`, {
                id: item.id,
                name: item.name,
                category: item.category,
                quantity: item.quantity,
                price: item.price,
                total: item.total,
                isPsyilocybinSpores: item. isPsyilocybinSpores
              });
            });

            triggerScale();
            toggleModalDropdown();
          } catch (e) {
            console.error(e);
          }
        };

            

        const removeFromCart = async (id: number) => {
          const item = cart.find(i => i.id === id);
          if (!item) return;
          try {
            const stock = await getStock(id);
            await router.post(route("item.update", { id }), {
              stock: stock + item.quantity,
              current_url: route("cart"),
            });
            setCart(curr => curr.filter(i => i.id !== id));

            
            triggerScale();
          } catch (e) {
            console.error(e);
          }
        };

        const updateCartQuantity = (id: number, quantity: number) => {
          setCart(curr => curr.map(i => i.id === id
            ? { ...i, quantity, total: i.price * quantity }
            : i
          ));
          triggerScale();
        };

        const changeItemQuantity = async (id: number, newQuantity: number) => {
          const itm = cart.find(i => i.id === id);
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

        const createOrder = (
          paymentIntentId: string,
          legalAgreement: boolean
        ) => {
          if (!cart.length) return;

          if (!shippingDetails) {
            console.error("Missing shipping details");
            return;
          }

          

          const data: any = {
            cart: JSON.stringify(cart),
            total,
            subtotal,
            weight,
            discount: promoDiscount,
            shippingDetails,
            paymentIntentId,
            shippingCost, // <-- add shippingCost here
          };
          console.log("cartcontext", data);

          if (hasPsyilocybinSporeSyringe) {
            data.legalAgreement = legalAgreement;
          }

          router.visit(route("checkout.process"), {
            method: "post",
            data,
            onFinish: () => {
              // Empty the cart on successful checkout
              setCart([]);  // Reset cart to an empty array
              console.log("Cart has been emptied.");
            }
          });
        };

        
        
        const handlePromoCodeValidation = () => {
          console.log(promoCode, " cartcontext");
          router.post(route("promo.validate"), { promoCode }, {
            onSuccess: page => {
              const p = (page.props as any);
              if (p.flash.success && p.discount) setPromoDiscount(p.discount);
              else console.error(p.error);
            },
            onError: e => console.error(e),
          });
        };

        const fetchShippingEstimate = async () => {
          if (cart.length == 0){
            return;
          }

          console.log("getting estimates")
          try {
            const { data } = await axios.post(route("cart.shipping.estimate"), { weight });
            if (Array.isArray(data) && data.length) {
              const filtered = data.map((r: any) => ({
                amount: r.amount,
                provider: r.provider,
                service: r.service,
              }));
              const ams = filtered.map(r => parseFloat(r.amount));
              setShippingCostEstimate([Math.min(...ams), Math.max(...ams)]);
            } else {
              setShippingCostEstimate([0, 0]);
            }
          } catch (e) {
            console.error("Error fetching shipping estimate:", e);
            setShippingCostEstimate([0, 0]);
          }
        };

        const fetchShippingRates = async () => {
          try {
            console.log("getting rates");
            const { data } = await axios.post(route("cart.shipping.rates"), {
              weight,
              ...shippingDetails,
            });

            if (Array.isArray(data) && data.length > 0) {
              const filtered: ShippingRate[] = data.map((r: any) => ({
                amount: r.amount,       // still a string, e.g. "5.00"
                provider: r.provider,
                service: r.service,
              }));
              
              // 1) Store all the rates
              setRates(filtered);

              // Convert all amounts to numbers
              const numericAmounts = filtered.map(r => parseFloat(r.amount));
              const smallest = Math.min(...numericAmounts);

              setShippingCost(smallest); 
              console.log("smallest :", smallest);
            } 
          } catch (e) {
            console.error("Error fetching shipping rates:", e);
          }
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
              rates,
              fetchShippingEstimate,
              fetchShippingRates,
              shippingCostEstimate,
              setShippingCostEstimate,
              shippingDetails,
              setShippingDetails,
              shippingCost,
              setShippingCost,
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
              createOrder,
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
